import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Box,
  CssBaseline,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Switch as MuiSwitch,
  TextField as MuiTextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import Logo from './logo.svg';
import AddIcon from '@material-ui/icons/Add';
import * as MdiIcons from 'mdi-material-ui';
import PropTypes from 'prop-types';
const { ipcRenderer } = window.require('electron');
import ConfigType from './lib/ConfigType';
import ConfigurationForm from './components/ConfigurationForm';

const LogoComponent = (props) => <img alt="" role="presentation" src={Logo} {...props} />;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  titleIcon: {
    height: '2rem',
    width: '2rem',
    marginRight: '0.35rem',
  },
  configurations: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'max-content',
    overflowY: 'auto',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  modalContainer: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    minWidth: '35vw',
    maxWidth: '80vw',
    minHeight: '35vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: theme.spacing(5),
    background: theme.palette.background.default,
  },
  tooltip: {
    fontSize: theme.typography.fontSize,
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'row',
    '& > *': {
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
    },
  },
  modalFormColumn: {
    display: 'flex',
    flexDirection: 'column',
    '& > *': {
      marginBottom: theme.spacing(3),
      width: '100%',
    },
  },
  chipList: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      flex: '0 30%',
      margin: theme.spacing(0.5),
    },
  },
  formActions: {
    justifyContent: 'flex-end',
  },
}));

const FormikState = ({ values, errors, touched }) => (
  <>
    <div
      style={{
        background: 'lightgrey',
        border: '2px solid black',
      }}
    >
      <strong>FORMIK STATE</strong>
      <hr />
      <pre>{JSON.stringify({ values, errors, touched }, null, 2)}</pre>
    </div>
  </>
);

FormikState.propTypes = {
  values: PropTypes.any,
  errors: PropTypes.any,
  touched: PropTypes.any,
};

const keyToDisplayName = (key) =>
  key
    .split(/[-._]/)
    .map((s) => s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase())
    .join(' ');

const iconLookup = (key) => {
  if (MdiIcons[key]) {
    return React.createElement(MdiIcons[key]);
  } else {
    return null;
  }
};

const configToComponent = (config, idx, setConfigurations, editConfiguration, classes) => {
  const displayName =
    config.displayName && config.displayName.length > 0
      ? config.displayName
      : keyToDisplayName(config.key);
  const icon = iconLookup(config.icon);
  const secondaryActions = [
    <IconButton
      key={`config_edit_button_${idx}`}
      onClick={() => {
        editConfiguration(config);
      }}
    >
      <MdiIcons.Pencil color={'primary'} />
    </IconButton>,
    <IconButton
      key={`config_delete_button_${idx}`}
      onClick={() => {
        setConfigurations((prevState) => {
          const copy = [...prevState];
          copy.splice(idx, 1);
          return copy;
        });
      }}
    >
      <MdiIcons.Delete color={'action'} />
    </IconButton>,
    <Tooltip
      key={`config_info_button_${idx}`}
      title={
        <div className={classes.tooltip}>
          <span>
            Key:<pre>{config.key}</pre>
          </span>
          <hr />
          <span>
            Description: <pre>{config.description}</pre>
          </span>
          <hr />
          <span>
            Tags: <pre>{config.tags && config.tags.join(', ')}</pre>
          </span>
        </div>
      }
    >
      <IconButton>
        <MdiIcons.Information />
      </IconButton>
    </Tooltip>,
  ];
  switch (config.type) {
    case ConfigType.STRING:
      return (
        <ListItem key={`${config.key}_${idx}`}>
          <ListItemIcon>{icon}</ListItemIcon>
          <MuiTextField
            label={displayName}
            defaultValue={config.value}
            onChange={(e) => {
              setConfigurations((prevState) => {
                const copy = [...prevState];
                copy[idx].value = e.target.value;
                return copy;
              });
            }}
          />
          <ListItemSecondaryAction>{secondaryActions}</ListItemSecondaryAction>
        </ListItem>
      );
    case ConfigType.SWITCH:
      return (
        <ListItem key={`${config.key}_${idx}`}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={displayName} />
          <ListItemSecondaryAction>
            <MuiSwitch
              checked={config.value}
              color={'primary'}
              onChange={(e) =>
                setConfigurations((prevState) => {
                  const copy = [...prevState];
                  copy[idx].value = e.target.checked;
                  return copy;
                })
              }
            />
            {secondaryActions}
          </ListItemSecondaryAction>
        </ListItem>
      );
    case ConfigType.NUMBER:
      return (
        <ListItem key={`${config.key}_${idx}`}>
          <ListItemIcon>{icon}</ListItemIcon>
          <MuiTextField
            label={displayName}
            defaultValue={config.value}
            type={'number'}
            onChange={(e) => {
              setConfigurations((prevState) => {
                const copy = [...prevState];
                try {
                  copy[idx].value = Number(e.target.value);
                } catch (ignored) {}
                return copy;
              });
            }}
          />
          <ListItemSecondaryAction>{secondaryActions}</ListItemSecondaryAction>
        </ListItem>
      );
  }
};

const determineTypeFromValue = (value) => {
  if (typeof value === 'number') {
    return ConfigType.NUMBER;
  }

  if (typeof value === 'boolean') {
    return ConfigType.SWITCH;
  }

  return ConfigType.STRING;
};

function App() {
  const classes = useStyles();
  const [createModal, setCreateModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [configurations, setConfigurations] = useState([]);
  useEffect(() => {
    let listener = (evt, arg) => {
      console.log(arg);
      setConfigurations((prevState) => {
        let dirty = false;
        const ret = [...prevState];
        for (let i = 0; i < arg.length; i++) {
          const spec = arg[i];
          if (spec.key) {
            const existing = ret.find((x) => x.key === spec.key);
            if (!existing) {
              dirty = true;
              ret.push({
                key: spec.key,
                value: spec.value,
                type: determineTypeFromValue(spec.value),
              });
            }
          }
        }
        return dirty ? ret : prevState;
      });
    };
    ipcRenderer.on('autospec', listener);
    return () => ipcRenderer.removeListener('autospec', listener);
  }, [setConfigurations]);
  useEffect(() => {
    const config = {};
    configurations.forEach((c) => (config[c.key] = c.value));
    ipcRenderer.send('config', config);
  }, [configurations]);
  return (
    <div>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position={'relative'}>
          <Toolbar>
            <LogoComponent className={classes.titleIcon} />
            <Typography>Ambeeance</Typography>
          </Toolbar>
        </AppBar>
        <Box component={'div'} className={classes.configurations}>
          <List>
            {configurations.map((config, idx) =>
              configToComponent(
                config,
                idx,
                setConfigurations,
                (edit) => setEditing(edit),
                classes,
              ),
            )}
          </List>
        </Box>
      </div>
      <Fab
        color={'primary'}
        aria-label={'add'}
        className={classes.fab}
        onClick={() => setCreateModal(true)}
      >
        <AddIcon />
      </Fab>
      <ConfigurationForm
        show={createModal}
        cancel={() => setCreateModal(false)}
        classes={classes}
        result={(r) => {
          setCreateModal(false);
          setConfigurations((prevState) => {
            return [...prevState, r];
          });
        }}
      />
      <ConfigurationForm
        show={!!editing}
        initial={editing}
        cancel={() => setEditing(null)}
        classes={classes}
        result={(r, initialKey) => {
          setEditing(null);
          setConfigurations((prevState) => {
            const copy = [...prevState];
            const index = copy.findIndex((c) => initialKey === c.key);
            if (index > -1) {
              Object.assign(copy[index], r);
            }
            return copy;
          });
        }}
      />
    </div>
  );
}

export default App;
