import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

type ConfigFormProps = {
    open: boolean;
    onClose: () => void;
    editData?: any;
};

const ConfigFormDialog: React.FC<ConfigFormProps> = ({ open, onClose, editData }) => {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: editData || {
            configName: '',
            type: 'Routien',
            status: 'started',
            sendTo: '',
            path: '',
            scheduleTimeHour: 0,
            scheduleTimeMinute: 1,
            description: '',
        },
    });

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (editData) {
                await axios.put(`http://103.86.50.71:30700/api/config-email/update/${editData.id}`, data);
            } else {
                await axios.post('http://103.86.50.71:30700/api/config-email/update/save', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configEmail'] });
            onClose();
        },
    });

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{editData ? 'Edit Config' : 'Add Config'}</DialogTitle>
            <DialogContent>
                <form id="configForm" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
                    <TextField label="Config Name" fullWidth margin="dense" {...register('configName')} required />
                    <TextField label="Send To" fullWidth margin="dense" {...register('sendTo')} required />
                    <TextField label="Path" fullWidth margin="dense" {...register('path')} required />
                    <TextField
                        label="Status"
                        select
                        fullWidth
                        margin="dense"
                        {...register('status')}
                        defaultValue="started"
                    >
                        <MenuItem value="started">Started</MenuItem>
                        <MenuItem value="stopped">Stopped</MenuItem>
                        <MenuItem value="error">Error</MenuItem>
                    </TextField>
                    <TextField label="Schedule Hour" type="number" fullWidth margin="dense" {...register('scheduleTimeHour')} />
                    <TextField label="Schedule Minute" type="number" fullWidth margin="dense" {...register('scheduleTimeMinute')} />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" form="configForm" variant="contained">
                    {editData ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigFormDialog;
