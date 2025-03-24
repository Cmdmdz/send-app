import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

type DeleteConfirmDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    configName?: string;
    selectedCount?: number; // Add this for multi-select
};

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    open,
    onClose,
    onConfirm,
    configName,
    selectedCount = 0,
}) => {
    const isBulkDelete = selectedCount > 1;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <Typography>
                    {isBulkDelete ? (
                        <>
                            Are you sure you want to delete <b>{selectedCount}</b> selected items?
                        </>
                    ) : (
                        <>
                            Are you sure you want to delete <b>{configName}</b>?
                        </>
                    )}{' '}
                    This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmDialog;
