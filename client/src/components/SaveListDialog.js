import React, { Component } from "react";
import {
  Dialog,
  Classes,
  InputGroup,
  Button,
  FormGroup
} from "@blueprintjs/core";

class SaveListDialog extends Component {
  state = {
    name: ""
  };

  onNameChange = e =>
    this.setState({
      name: e.target.value
    });

  onSave = () => {
    const { onSave, handleClose } = this.props;
    const { name } = this.state;
    if (!name) {
      window.toastr.error("Please enter a name");
    } else {
      handleClose();
      onSave(name);
    }
  };

  render() {
    const { isOpen, handleClose } = this.props;
    return (
      <Dialog
        isOpen={isOpen}
        icon="save"
        onClose={handleClose}
        title="Save List"
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Name">
            <InputGroup value={this.state.name} onChange={this.onNameChange} />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button minimal onClick={handleClose}>
              Close
            </Button>
            <Button intent="primary" onClick={this.onSave}>
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default SaveListDialog;
