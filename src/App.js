import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CssBaseline,
  Fab,
  FormControl,
  FormLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Modal,
  Switch as MuiSwitch,
  TextField as MuiTextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import * as MdiIcons from 'mdi-material-ui';
import { Field, FieldArray, Form, Formik } from 'formik';
import { Select, Switch, TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
const { ipcRenderer } = window.require('electron');

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

const ConfigType = {
  SWITCH: 0,
  STRING: 1,
  NUMBER: 2,
};
Object.freeze(ConfigType);

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

const configToComponent = (config, idx, setConfigurations, classes) => {
  const displayName =
    config.displayName && config.displayName.length > 0
      ? config.displayName
      : keyToDisplayName(config.key);
  const icon = iconLookup(config.icon);
  const secondaryActions = [
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

const componentForType = (type) => {
  switch (type) {
    case ConfigType.SWITCH:
      return [Switch, {}];
    case ConfigType.NUMBER:
      return [TextField, { type: 'number' }];
    case ConfigType.STRING:
      return [TextField, {}];
  }
};

function App() {
  const classes = useStyles();
  const [modal, setModal] = useState(false);
  const [configurations, setConfigurations] = useState([]);
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
            <Typography>🐝 Ambeeance</Typography>
          </Toolbar>
        </AppBar>
        <Box component={'div'} className={classes.configurations}>
          <List>
            {configurations.map((config, idx) =>
              configToComponent(config, idx, setConfigurations, classes),
            )}
          </List>
        </Box>
      </div>
      <Fab
        color={'primary'}
        aria-label={'add'}
        className={classes.fab}
        onClick={() => setModal(true)}
      >
        <AddIcon />
      </Fab>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        className={classes.modalContainer}
        disableAutoFocus={true}
      >
        <Card className={classes.modalBody}>
          <CardHeader title={'Add Configuration'} />
          <Formik
            initialValues={{
              key: '',
              displayName: '',
              description: '',
              value: '',
              type: ConfigType.STRING,
              tags: [],
              _meta: {
                addTag: '',
              },
            }}
            onSubmit={(values, formikHelpers) => {
              const { key, displayName, description, value, type, tags } = values;
              setConfigurations((prevState) => {
                return [...prevState, { key, displayName, description, value, type, tags }];
              });
              setModal(false);
            }}
          >
            {({ values, setFieldValue, submitForm }) => {
              if (values.type === ConfigType.SWITCH && typeof values.value !== 'boolean') {
                setFieldValue('value', !!values.value, false);
              }
              const [valueComponent, valueProps] = componentForType(values.type);
              return (
                <>
                  <CardContent>
                    <Form>
                      <div className={classes.modalForm}>
                        <div className={classes.modalFormColumn}>
                          <Field
                            component={TextField}
                            type={'string'}
                            name={'key'}
                            label={'Key'}
                            value={values.key}
                          />
                          <FormControl>
                            <InputLabel>Type</InputLabel>
                            <Field
                              component={Select}
                              name={'type'}
                              label={'Type'}
                              value={values.type}
                            >
                              <MenuItem value={ConfigType.STRING}>String</MenuItem>
                              <MenuItem value={ConfigType.SWITCH}>Switch</MenuItem>
                              <MenuItem value={ConfigType.NUMBER}>Number</MenuItem>
                            </Field>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Value</FormLabel>
                            <Field
                              component={valueComponent}
                              {...valueProps}
                              name={'value'}
                              value={values.value}
                              checked={values.value}
                            />
                          </FormControl>
                        </div>
                        <div className={classes.modalFormColumn}>
                          <Field
                            component={TextField}
                            type={'string'}
                            name={'displayName'}
                            label={'Display Name'}
                            value={values.displayName}
                          />
                          <Field
                            component={TextField}
                            name={'description'}
                            value={values.description}
                            type={'string'}
                            label={'Description'}
                          />
                          <FieldArray
                            name={'tags'}
                            render={(arrayHelpers) => {
                              const push = () => {
                                if (values._meta.addTag && values._meta.addTag.length > 0) {
                                  arrayHelpers.push(values._meta.addTag);
                                  setFieldValue('_meta.addTag', '', false);
                                }
                              };
                              return (
                                <FormControl>
                                  <FormLabel>Tags</FormLabel>
                                  <div className={classes.chipList}>
                                    {values.tags.map((tag, index) => (
                                      <Chip
                                        key={`tag_${index}`}
                                        label={tag}
                                        onDelete={() => arrayHelpers.remove(index)}
                                      />
                                    ))}
                                  </div>
                                  <List>
                                    <ListItem>
                                      <Field
                                        value={values._meta.addTag}
                                        component={TextField}
                                        name={'_meta.addTag'}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            push();
                                          }
                                        }}
                                      />
                                      <ListItemSecondaryAction>
                                        <IconButton onClick={push}>
                                          <AddIcon />
                                        </IconButton>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  </List>
                                </FormControl>
                              );
                            }}
                          />
                        </div>
                      </div>
                    </Form>
                  </CardContent>
                  <CardActions className={classes.formActions}>
                    <Button
                      color={'secondary'}
                      onClick={() => {
                        setModal(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button color={'primary'} onClick={submitForm}>
                      Add Configuration
                    </Button>
                  </CardActions>
                </>
              );
            }}
          </Formik>
        </Card>
      </Modal>
    </div>
  );
}

export default App;
