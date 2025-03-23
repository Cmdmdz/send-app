import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

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
    }, [editData, reset]);

    const handleAddCc = () => {
        const trimmed = ccInput.trim();
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

        if (isValidEmail && !ccList.includes(trimmed)) {
            const updatedList = [...ccList, trimmed];
            setCcList(updatedList);
            setValue('cc', updatedList.join(','));
            setCcInput('');
        } else {
            alert('Invalid or duplicate email');
        }
    };

    const handleRemoveCc = (email: string) => {
        const updatedList = ccList.filter(e => e !== email);
        setCcList(updatedList);
        setValue('cc', updatedList.join(','));
    };

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (editData) {
                await axios.put(`https://sdh.briaservices.com/api/config-email/update/${editData.id}`, data);
            } else {
                await axios.post('https://sdh.briaservices.com/api/config-email/save', data);
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
                            onChange={(e) => setCcInput(e.target.value)}
                            fullWidth
                            margin="dense"
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
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" form="configForm" variant="contained">
                    {editData ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigFormDialog;
