import { Grid } from '@mui/material';
import { Layout } from './components/Layout';
import { Configuration } from './components/Configuration';
import { Controls } from './components/Controls';
import { Visualization } from './components/Visualization';
import { Metrics } from './components/Metrics';

function App() {
  return (
    <Layout>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Visualization />
            </Grid>
            <Grid item xs={12}>
              <Configuration />
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controls />
            </Grid>
            <Grid item xs={12}>
              <Metrics />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default App;

