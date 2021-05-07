import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  FormLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  MenuItem,
  Modal,
} from '@material-ui/core';
import { Field, FieldArray, Form, Formik } from 'formik';
import { Select, Switch, TextField } from 'formik-material-ui';
import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import ConfigType from '../lib/ConfigType';

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

const ConfigurationForm = ({ show, cancel, result, classes, initial }) => {
  const initialValues = {
    key: '',
    displayName: '',
    description: '',
    value: '',
    type: ConfigType.STRING,
    tags: [],
    _meta: {
      addTag: '',
    },
    ...(initial || {}),
  };
  return (
    <Modal open={show} onClose={cancel} className={classes.modalContainer} disableAutoFocus={true}>
      <Card className={classes.modalBody}>
        <CardHeader title={'Add Configuration'} />
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            const { key, displayName, description, value, type, tags } = values;
            result({ key, displayName, description, value, type, tags }, initial?.key);
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
                  <Button color={'secondary'} onClick={cancel}>
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
  );
};

export default ConfigurationForm;
