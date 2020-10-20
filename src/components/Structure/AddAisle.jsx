import React from "react"
import { Button, Input, Select, Form, message, Row, Col, Icon } from "antd"
import { pathSM } from "../../servicesURL"
import { isJsonValid, handleErrorNotification } from '../../util/errorHandler.js'
import Cookies from 'js-cookie'

const { Option } = Select

export default class AddAisle extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            contactData: this.props.contactData,
            marketData: this.props.marketData,
            visible: false,
            disableSubmitButton: false,
            selectedEnv: null,
            buildDrawer: false,
            floorDrawer: false,
            envirDrawer: false,
            selectedBuilding: 0,
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                //console.log('Received values of form: ', values);
                this.addAisle(values)
            }
        });
    }

    selectBuilding = (value) => {
        this.setState({
            selectedBuilding: value - 1
        })
        //console.log("State " + this.state.selectedBuilding + " Selected " + value)
    }

    addAisle = async (aisle) => {
        // console.log(JSON.stringify({
        //     marketId: aisle.marketId,
        //     responsibleEmployeeId: aisle.responsibleEmployeeId,
        //     name: aisle.name,
        // }))
        this.setState({ disableSubmitButton: true })
        try {
            const port = "8084";
            const res = await fetch(pathSM + port + `/aisle/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': Cookies.get('adm-token')
                }, body: JSON.stringify({
                    marketId: aisle.marketId,
                    responsibleEmployeeId: aisle.responsibleEmployeeId,
                    name: aisle.name,
                })
            })

            const json = await res.json();

            if (isJsonValid(json)) { 
                message.success('Setor adicionado com sucesso'); 
                this.props.form.resetFields(); 
                this.setState({ disableSubmitButton: false, floorDrawer: false }) 
            } else { 
                handleErrorNotification(json)
                this.setState({ disableSubmitButton: false })
            }

            this.props.reload();

        } catch (error) {
            handleErrorNotification(error)
            this.setState({ disableSubmitButton: false })
        }
    }

    render() {

        const { getFieldDecorator } = this.props.form;

        return (
            <div>
                <Form layout="horizontal" onSubmit={this.handleSubmit}>

                    <Row gutter={5}>
                        <Col span={24}>
                            <Form.Item
                                label={"Loja"}
                            >
                                {getFieldDecorator("marketId", {
                                    rules: [
                                        {
                                            required: true,
                                        }
                                    ]
                                })(
                                    <Select
                                        disabled={this.state.disabled}
                                    >
                                        {this.state.marketData.map((market) => {
                                            return (
                                                <Option value={market.marketId}>{market.name}</Option>
                                            )
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={5}>
                        <Col span={24}>
                            <Form.Item
                                label={"Setor"}
                            >
                                {getFieldDecorator("name", {
                                    rules: [
                                        {
                                            required: true,
                                        }
                                    ]
                                })(
                                    <Input
                                        disabled={this.state.disabled}
                                        prefix={
                                            <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                                        }
                                    />
                                )}
                            </Form.Item>
                        </Col>

                    </Row>

                    <Form.Item label={"Funcionário Responsável"}>
                        {getFieldDecorator('responsibleEmployeeId', {
                            rules: [{ required: true, message: "Por favor, selecione o funcionário responsável." }],
                        })(
                            <Select
                                disabled={this.state.disabled}
                            >
                                {this.state.contactData.map((contact) => {
                                    return (
                                        <Option value={contact.contactId}>{contact.name + " " + contact.lastName}</Option>
                                    )
                                })}
                            </Select>
                        )}
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={this.state.disableSubmitButton}>Confirmar</Button>
                    <Button type="primary" style={{ marginLeft: '.5rem' }} onClick={() => this.props.form.resetFields()}>Limpar</Button>
                </Form>
            </div>
        );
    }
}

AddAisle = Form.create({})(AddAisle);
