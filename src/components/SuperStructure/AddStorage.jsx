import React from "react"
import { Button, Input, Select, Form, message, Col, Row } from "antd"
import { pathSM } from "../../servicesURL"
import { isJsonValid, handleErrorNotification } from '../../util/errorHandler'
import Cookies from 'js-cookie'

const { Option } = Select;

export default class AddStorage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            storageModelData: [],
            disableSubmitButton: false,
            visible: false,
            selectedEnv: null,
            buildDrawer: false,
            floorDrawer: false,
            envirDrawer: false,
            selectedMarket: 0,
        }
    }

    getAllStorageModel = async () => {
        try {
            const port = '8084'
            const res = await fetch(pathSM + port + `/storage/model/findAll`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': Cookies.get('sm-token')
                },
            })

            const json = await res.json();


            if (isJsonValid(json))
                this.setState({ storageModelData: json.storageModelData });
            else
                handleErrorNotification(json)

        } catch (error) {
            handleErrorNotification(error)
        }
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                //console.log('Received values of form: ', values);
                this.addStorage(values);
            }
        });
    }

    selectMarket = (value) => {
        console.log(value)
        this.setState({
            selectedMarket: value
        })
    }

    addStorage = async (storage) => {
        this.setState({ disableSubmitButton: true })
        console.log(
            JSON.stringify({
                aisleId: storage.aisleId,
                storageModelId: storage.storageModelId,
                name: storage.name,
            })
        )
        try {
            const port = "8084"
            const res = await fetch(pathSM + port + `/storage/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': Cookies.get('adm-token')
                }, body: JSON.stringify({
                    aisleId: storage.aisleId,
                    storageModelId: storage.storageModelId,
                    name: storage.name,
                })
            })
            const json = await res.json();

            if (isJsonValid(json)) {
                message.success('Refrigerador adicionado com sucesso');
                this.setState({ disableSubmitButton: false, floorDrawer: false })
                this.props.form.resetFields();
                this.props.reload()
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

    componentDidMount(){
        this.getAllStorageModel();
    }

    render() {

        const { getFieldDecorator } = this.props.form;

        if (this.props.marketData[this.state.selectedMarket] && this.props.marketData[this.state.selectedMarket].aisles)
            this.props.marketData[this.state.selectedMarket].aisles.sort((a, b) => a.name.localeCompare(b.name))

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
                                        onSelect={(mk) => this.selectMarket(mk)}
                                    >
                                        {this.props.marketData.map((market, idx) => {
                                            return (
                                                <Option value={idx}>{market.name}</Option>
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
                                {getFieldDecorator('aisleId', {
                                    rules: [{ required: true, message: "Por favor, entre com o nome." }],
                                })(
                                    <Select>
                                        {(this.props.marketData[this.state.selectedMarket] && this.props.marketData[this.state.selectedMarket].aisles) &&
                                            this.props.marketData[this.state.selectedMarket].aisles.map((aisle) => {
                                                return (
                                                    <Option value={aisle.aisleId}>{aisle.name}</Option>
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
                                label={"Refrigerador"}
                            >
                                {getFieldDecorator('name', {
                                    rules: [{ required: true, message: "Por favor, entre com o nome." }],
                                })(
                                    <Input disabled={this.state.disabled} />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>


                    <Form.Item label={"Modelo de Refrigerador"}>
                        {getFieldDecorator('storageModelId', {
                            rules: [{ required: true, message: "Por favor, selecione o modelo do refrigerador." }],
                        })(
                            <Select
                                disabled={this.state.disabled}
                            >
                                {this.state.storageModelData.map((storageModel) => {
                                    return (
                                        <Option value={storageModel.storageModelId}>{storageModel.manufacturer} - {storageModel.description}</Option>
                                    )
                                })}
                            </Select>
                        )}
                    </Form.Item>
                    <Col>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={this.state.disableSubmitButton}>
                            Confirmar
                        </Button>
                        <Button type="primary" style={{ marginLeft: '.5rem' }} onClick={() => this.props.form.resetFields()}>Limpar</Button>
                    </Col>
                </Form>
            </div>
        );
    }
}

AddStorage = Form.create({})(AddStorage);
