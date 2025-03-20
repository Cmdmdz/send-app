import React, { useMemo, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import { Button, CircularProgress, Alert, IconButton, Box } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import ConfigFormDialog from './ConfigFormDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

type ConfigResponse = {
    id: number;
    configName: string;
    type: string;
    status: string;
    sendTo: string;
    path: string;
    backup?: string;
    settingSmtpId: number;
    scheduleTimeHour: number;
    scheduleTimeMinute: number;
    description?: string;
};

const ConfigTable = () => {
    const queryClient = useQueryClient();
    const [editData, setEditData] = useState<ConfigResponse | null>(null);
    const [openForm, setOpenForm] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<ConfigResponse | null>(null);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set()); // Store selected IDs

    // Fetch Configurations
    const { data, isLoading, isError } = useQuery({
        queryKey: ['configEmail'],
        queryFn: async () => {
            const res = await axios.get('http://103.86.50.71:30700/api/config-email/list');
            return res.data;
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(`http://103.86.50.71:30700/api/config-email/delete/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configEmail'] });
            setOpenDeleteDialog(false);
        },
    });

    // Update Status Mutation (Loop for multiple requests)
    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            await Promise.all(
                Array.from(selectedRows).map(async (id) => {
                    await axios.put(`http://103.86.50.71:30700/api/config-email/update/status/${id}`, null, {
                        params: { status },
                    });
                })
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configEmail'] });
            setSelectedRows(new Set()); // Clear selection
        },
    });

    const handleDelete = () => {
        if (selectedConfig) {
            deleteMutation.mutate(selectedConfig.id);
        }
    };

    // Function to handle "Select All" checkbox
    const handleSelectAll = () => {
        if (data) {
            if (selectedRows.size === data.length) {
                setSelectedRows(new Set()); // Deselect all
            } else {
                setSelectedRows(new Set(data.map((row: ConfigResponse) => row.id))); // Select all
            }
        }
    };

    // Define Columns
    const columns = useMemo<MRT_ColumnDef<ConfigResponse>[]>(
        () => [
            {
                id: 'select',
                header: 'Select', // Must be a string, but we override using muiTableHeadCellProps
                muiTableHeadCellProps: {
                    align: 'center',
                },
                muiTableBodyCellProps: {
                    align: 'center',
                },
                Cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={selectedRows.has(row.original.id)}
                        onChange={() => {
                            const newSelection = new Set(selectedRows);
                            if (newSelection.has(row.original.id)) {
                                newSelection.delete(row.original.id);
                            } else {
                                newSelection.add(row.original.id);
                            }
                            setSelectedRows(newSelection);
                        }}
                    />
                ),
                Header: () => (
                    <input
                        type="checkbox"
                        checked={data && selectedRows.size === data.length}
                        onChange={handleSelectAll}
                    />
                ),
            },
            { accessorKey: 'configName', header: 'Config Name' },
            { accessorKey: 'type', header: 'Type' },
            { accessorKey: 'status', header: 'Status' },
            { accessorKey: 'sendTo', header: 'Send To' },
            { accessorKey: 'path', header: 'Path' },
            {
                header: 'Actions',
                Cell: ({ row }) => (
                    <>
                        <IconButton onClick={() => {
                            setEditData(row.original);
                            setOpenForm(true);
                        }}>
                            <Edit color="primary" />
                        </IconButton>
                        <IconButton onClick={() => {
                            setSelectedConfig(row.original);
                            setOpenDeleteDialog(true);
                        }}>
                            <Delete color="error" />
                        </IconButton>
                    </>
                ),
            },
        ],
        [selectedRows, data]
    );
    

    const table = useMaterialReactTable({
        columns,
        data: data ?? [],
        state: { isLoading, showAlertBanner: isError },
    
        // 🔹 Force density to "compact"
        initialState: { density: 'compact' },
    
        // 🔹 Disable the density toggle menu
        enableDensityToggle: false, 
    });
    

    if (isLoading) return <CircularProgress />;
    if (isError) return <Alert severity="error">Failed to load config email data</Alert>;

    return (
        <>
            <Box display="flex" gap={2} mb={2}>
                <Button variant="contained" onClick={() => setOpenForm(true)}>
                    Add Config
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedRows.size === 0}
                    onClick={() => updateStatusMutation.mutate('started')}
                >
                    Start Selected
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    disabled={selectedRows.size === 0}
                    onClick={() => updateStatusMutation.mutate('stopped')}
                >
                    Stop Selected
                </Button>
            </Box>

            <MaterialReactTable table={table} />
            
            {openForm && <ConfigFormDialog open={openForm} onClose={() => setOpenForm(false)} editData={editData} />}
            
            <DeleteConfirmDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDelete}
                configName={selectedConfig?.configName}
            />
        </>
    );
};

export default ConfigTable;
