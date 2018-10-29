import React, { Component } from "react";
import Select from "react-select";
import { Dialog, Classes, Button, FormGroup } from "@blueprintjs/core";

class SaveListDialog extends Component {
  state = {
    value: null
  };

  onChange = value =>
    this.setState({
      value
    });

  onLoad = () => {
    const { onSelect, handleClose } = this.props;
    const { value } = this.state;
    if (!value) {
      window.toastr.error("Please choose a list to load.");
    } else {
      handleClose();
      onSelect(value.value);
    }
  };

  removeOption = () => {
    this.props.removeItem(this.state.value.value);
    this.setState({
      value: null
    });
  };

  render() {
    const { isOpen, handleClose, options } = this.props;
    return (
      <Dialog isOpen={isOpen} onClose={handleClose} title="Load List">
        <div className={Classes.DIALOG_BODY}>
          <div style={{ color: "black" }}>
            <FormGroup label="Choose List">
              <Select
                options={options}
                onChange={this.onChange}
                value={this.state.value}
              />
            </FormGroup>
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button minimal onClick={handleClose}>
              Close
            </Button>
            <Button
              intent="Danger"
              text="Delete"
              disabled={!this.state.value}
              onClick={this.removeOption}
            />
            <Button intent="primary" onClick={this.onLoad}>
              Load
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default SaveListDialog;
