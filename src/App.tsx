import React, { Suspense } from 'react';
import { Container } from '@mui/material';
import ConfigTable from './component/ConfigTable';

function App() {

  return (
    <Container>
        <h1>Config Email Management</h1>
        <ConfigTable />
    </Container>
);
}

export default App;
