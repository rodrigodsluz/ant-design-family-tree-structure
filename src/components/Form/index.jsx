import React from 'react';
import { Form, Input, Button } from 'antd';
import 'antd/dist/antd.css';


class Demo extends React.Component {
  formRef = React.createRef();
  onFinish = (values) => {
    console.log(values);
  };
  onReset = () => {
    this.formRef.current.resetFields();
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
          <Button htmlType="button" onClick={this.onReset}>
            Reset
          </Button>
          
        </Form.Item>
      </Form>
    );
  }
}

export default Demo;