import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { log } from 'console';

type ConfigFormProps = {
    open: boolean;
    onClose: () => void;
    editData?: any;
};

const ConfigFormDialog: React.FC<ConfigFormProps> = ({ open, onClose, editData }) => {
    const { register, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            configName: '',
            type: 'Routien',
            status: 'started',
            sendTo: '',
            cc: '',
            path: '',
            backup: '',
            settingSmtpId: 103,
            scheduleTimeHour: 0,
            scheduleTimeMinute: 1,
            description: '',
        },
    });

    const [ccInput, setCcInput] = useState('');
    const [ccList, setCcList] = useState<string[]>([]);
    const [apiError, setApiError] = useState(''); // <-- NEW
    const [ccError, setCcError] = useState('');

    const queryClient = useQueryClient();

    useEffect(() => {
        if (editData) {
            reset(editData);

            if (editData.cc) {
                const existingCC = editData.cc.split(',').map((e: string) => e.trim());
                setCcList(existingCC);
            }
        } else {
            reset({
                configName: '',
                type: 'Routien',
                status: 'started',
                sendTo: '',
                cc: '',
                path: '',
                backup: '',
                settingSmtpId: 103,
                scheduleTimeHour: 0,
                scheduleTimeMinute: 1,
                description: '',
            });
            setCcList([]);
        }

        setApiError(''); // clear error when dialog opens
    }, [editData, reset]);

    const handleAddCc = () => {
        const trimmed = ccInput.trim();
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

        if (!trimmed) {
            setCcError('Please enter an email address.');
            return;
        }

        if (!isValidEmail) {
            setCcError('Invalid email format.');
            return;
        }

        if (ccList.includes(trimmed)) {
            setCcError('Email already added.');
            return;
        }

        const updatedList = [...ccList, trimmed];
        setCcList(updatedList);
        setValue('cc', updatedList.join(','));
        setCcInput('');
        setCcError(''); // clear error
    };


    const handleRemoveCc = (email: string) => {
        const updatedList = ccList.filter(e => e !== email);
        setCcList(updatedList);
        setValue('cc', updatedList.join(','));
    };

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (editData) {
                return await axios.put(`https://sdh.briaservices.com/api/config-email/update/${editData.id}`, data);
            } else {
                return await axios.post('https://sdh.briaservices.com/api/config-email/save', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configEmail'] });
            setApiError('');
            onClose();
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'An unexpected error occurred.';
            setApiError(message);
        },
    });




    const handleClose = () => {
        setApiError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{editData ? 'Edit Config' : 'Add Config'}</DialogTitle>
            <DialogContent>
                {apiError && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        {apiError}
                    </div>
                )}

                <form id="configForm" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
                    <TextField label="Config Name" fullWidth margin="dense" {...register('configName')} required />

                    <TextField
                        label="Type"
                        select
                        fullWidth
                        margin="dense"
                        {...register('type')}
                        defaultValue="Routien"
                    >
                        <MenuItem value="Routien">Routien</MenuItem>
                        <MenuItem value="Bacteria">Bacteria</MenuItem>
                    </TextField>

                    <TextField
                        label="SMTP Setting"
                        select
                        fullWidth
                        margin="dense"
                        {...register('settingSmtpId')}
                        defaultValue={103}
                    >
                        <MenuItem value={103}>Gmail</MenuItem>
                        <MenuItem value={102}>ZeptoMail</MenuItem>
                    </TextField>

                    <TextField label="Send To" fullWidth margin="dense" {...register('sendTo')} required />

                    {/* ✅ CC Field with Add/Remove Email Logic */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <TextField
                            label="Add CC"
                            value={ccInput}
                            onChange={(e) => {
                                setCcInput(e.target.value);
                                if (ccError) setCcError(''); // Clear error on typing
                            }}
                            fullWidth
                            margin="dense"
                            error={!!ccError}
                            helperText={ccError}
                        />

                        <Button variant="contained" onClick={handleAddCc} style={{ marginTop: '8px' }}>
                            Add
                        </Button>
                    </div>

                    <div style={{ marginBottom: '10px', marginTop: '5px' }}>
                        {ccList.map(email => (
                            <span
                                key={email}
                                style={{
                                    display: 'inline-block',
                                    background: '#eee',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    marginRight: '5px',
                                    marginTop: '5px',
                                }}
                            >
                                {email}
                                <Button
                                    size="small"
                                    onClick={() => handleRemoveCc(email)}
                                    style={{ minWidth: 'auto', marginLeft: 5 }}
                                >
                                    x
                                </Button>
                            </span>
                        ))}
                    </div>
                    <input type="hidden" {...register('cc')} />

                    <TextField label="Path" fullWidth margin="dense" {...register('path')} required />
                    <TextField label="Backup" fullWidth margin="dense" {...register('backup')} />
                    <TextField
                        label="Schedule Hour"
                        type="number"
                        fullWidth
                        margin="dense"
                        {...register('scheduleTimeHour')}
                    />
                    <TextField
                        label="Schedule Minute"
                        type="number"
                        fullWidth
                        margin="dense"
                        {...register('scheduleTimeMinute')}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        margin="dense"
                        multiline
                        rows={2}
                        {...register('description')}
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" form="configForm" variant="contained">
                    {editData ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigFormDialog;
