import React from 'react';
import { Form, Input, Button } from 'antd';
import 'antd/dist/antd.css';


export default class Demo extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      disabled: true,
    };
  }

  formRef = React.createRef();
  onFinish = (values) => {
    // // console.log(values);
    
        this.updateRegion(values);
      
  };
 

  handleCancel = (e) => {
    this.setState({
      isEditing: false,
      disabled: true,
    });
    this.formRef.current.resetFields();
  };

  updateRegion = values => {
    console.log(values);
  }

  handleSubmitRegion = (e) => {
    e.preventDefault();
    this.formRef.current.scrollToField((err, values) => {
      if (!err) {
        this.updateRegion(values);
      }
    });
  };

  handleEdit = () => {
    this.setState({
      isEditing: true,
      disabled: false,
    });
  };




  render() {
    return (
      <Form ref={this.formRef}  onFinish={this.onFinish}>
        <Form.Item
          name="note"
          label="Note"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={this.handleCancel}>
            Reset
          </Button>
          
        </Form.Item>

        {this.state.isEditing ? (
            <div>
              <Form.Item >
                <Button
                  type="primary"
                  htmlType="submit"
                >
                  Salvar Alterações
                </Button>
              </Form.Item>
              
                <Button onClick={this.handleCancel}>Cancelar</Button>
                
            </div>
            ) : (
              <Button type="primary" onClick={this.handleEdit}>
                Editar dados
              </Button>
            )}

      </Form>
    );
  }
}
