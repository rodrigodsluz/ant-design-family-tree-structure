import React from "react"
import { Button, Icon, Input, Form, Select, message, Col, Row } from "antd"
import { pathSM } from "../../servicesURL"
import MaskedInput from 'react-text-mask'
import { isJsonValid, handleErrorNotification } from '../../util/errorHandler.js'
import Cookies from 'js-cookie'

const Option = Select.Option

export default class AddMarket extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            disableSubmitButton: false,
            companyId: this.props.marketData.companyId,
            contactData: this.props.contactData,
            isFetchedCep: false,
            isFetchingCep: false,
            cepData: {
                cep: "",
                logradouro: "",
                complemento: "",
                bairro: "",
                localidade: "",
                uf: "",
                unidade: "",
                ibge: "",
                gia: ""
            }
        }
    }

    apiCep = async (cep) => {
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            const json = await res.json();

            this.setState({ cepData: json, isFetchedCep: true, isFetchingCep: false });

            this.props.form.setFieldsValue({
                'address': json.logradouro,
                'city': json.localidade,
                'state': json.uf,
                'country': "Brasil",
                'district': json.bairro
            })

        } catch (error) {
            this.setState({ isFetchedCep: true, isFetchingCep: false });
            this.props.form.setFieldsValue({ 'country': "Brasil" });
            console.log("Fetching CEP encountered an error:", error)
        }
    }

    getCepInfo = (e) => {
        const value = e.target.value
        const cep = value.replace(/_/g, '').replace('-', '')

        if (cep.length === 8) {
            this.apiCep(cep)
            this.setState({ isFetchingCep: true })
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                //console.log('Received values of form: ', values);
                this.addMarket(values)
            }
        });
    }

    addMarket = async (market) => {
        this.setState({ disableSubmitButton: true });
        try {
            const port = "8084";
            const res = await fetch(pathSM + port + `/market/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': Cookies.get('adm-token')
                }, body: JSON.stringify({
                    companyId: parseInt(this.props.companyId),
                    generalManagerId: market.generalManagerId,
                    responsibleEmployeeId: market.responsibleEmployeeId,
                    companyCode: market.companyCode,
                    name: market.name,
                    socialName: market.socialName,
                    address: market.address,
                    number: market.number,
                    complementaryAddress: market.complementaryAddress,
                    zipCode: market.zipCode,
                    district: market.district,
                    city: market.city,
                    state: market.state,
                    country: market.country,
                    phone: market.phone,
                    mobilePhone: market.mobilePhone,
                })
            })

            const json = await res.json();

            if (isJsonValid(json)) {
                message.success('Loja adicionada com sucesso');
                this.setState({ disableSubmitButton: false, floorDrawer: false });
                this.props.form.resetFields();
                this.props.reload();
            } else {
                handleErrorNotification(json)
            }

            this.setState({ disableSubmitButton: false });

        } catch (error) {
            handleErrorNotification(error)
            this.setState({ disableSubmitButton: false });
        }
    }

    render() {

        const validateCNPJ = (rule, value, callback) => {
            var b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

            if ((value = value.replace(/[^\d]/g, "")).length != 14)
                callback("CNPJ inválido");

            if (/0{14}/.test(value))
                callback("CNPJ inválido");

            for (var i = 0, n = 0; i < 12; n += value[i] * b[++i]);
            if (value[12] != (((n %= 11) < 2) ? 0 : 11 - n))
                callback("CNPJ inválido");

            for (var i = 0, n = 0; i <= 12; n += value[i] * b[i++]);
            if (value[13] != (((n %= 11) < 2) ? 0 : 11 - n))
                callback("CNPJ inválido");

            //this.validarCNPJ(original);

            callback();
            //01.142.849/0001-62

        };

        const statesBR = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
        const stateOptions = [];
        for (let i = 0; i < statesBR.length; i++) {
            stateOptions.push(<Option value={statesBR[i]}>{statesBR[i]}</Option>);
        }

        const { getFieldDecorator } = this.props.form;

        return (
            <Form layout="horizontal" onSubmit={this.handleSubmit}>
                <Row gutter={5}>
                    <Col span={24}>
                        <Form.Item label="Loja">
                            {getFieldDecorator("name", {
                                rules: [
                                    {
                                        required: true,
                                        message: "Por favor entre com um nome para a loja"
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

                <Row gutter={5}>
                    <Col span={24}>
                        <Form.Item label="Razão Social">
                            {getFieldDecorator("socialName", {
                                rules: [
                                    {
                                        required: true,
                                        message: "Por favor entre com a razão social da loja"
                                    }
                                ]
                            })(
                                <Input
                                    disabled={this.state.disabled}
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        <Form.Item label="CNPJ">
                            {getFieldDecorator('companyCode', {
                                validateTrigger: 'onBlur',
                                rules: [{ required: true, validator: validateCNPJ, pattern: /^([0-9]{2}[.]?[0-9]{3}[.]?[0-9]{3}[/]?[0-9]{4}[-]?[0-9]{2})|([0-9]{3}[.]?[0-9]{3}[.]?[0-9]{3}[-]?[0-9]{2})$/, message: "Por favor, entre com o CNPJ." }],
                            })(
                                <MaskedInput
                                    mask={[/[0-9]/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
                                    className="ant-input"
                                    placeholder="00.000.000/000-00"
                                    disabled={this.state.disabled}
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Telefone">
                            {getFieldDecorator('phone', {
                                initialValue: "",
                                rules: [{
                                    required: false, pattern: /^\([1-9]{2}\) (?:[1-9]|[1-9][1-9])[0-9]{3}-[0-9]{4}$/,
                                    message: "Por favor, entre com o seu telefone."
                                }],
                            })(
                                <MaskedInput
                                    mask={['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                                    className="ant-input"
                                    placeholder="(00) 0000-0000"
                                />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Celular">
                            {getFieldDecorator('mobilePhone', {
                                initialValue: "",
                                rules: [{
                                    required: false, pattern: /^\([1-9]{2}\) (?:[1-9]|[1-9][1-9])[0-9]{3}-[0-9]{4}$/,
                                    message: "Por favor, entre com o seu telefone."
                                }],
                            })(
                                <MaskedInput
                                    mask={['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                                    className="ant-input"
                                    placeholder="(00) 00000-0000"
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="CEP">
                            {getFieldDecorator('zipCode', {
                                rules: [{ required: true, pattern: /^[0-9]{5}-[0-9]{3}$/, message: "Por favor, entre com o CEP." }],
                            })(
                                <MaskedInput
                                    mask={[/[0-9]/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]}
                                    className={(!this.state.isFetchingCep) ? "ant-input" : "mask-input-disabled"}
                                    placeholder="00000-000"
                                    disabled={this.state.isFetchingCep || this.state.disabled}
                                    onChange={this.getCepInfo}
                                />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Endereço">
                            {getFieldDecorator('address', {
                                rules: [{ required: true, message: "Por favor, entre com o endereço.", max: 200, }],
                            })(
                                <Input disabled={this.state.cepData.logradouro || this.state.disabled} />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Cidade">
                            {getFieldDecorator('city', {
                                rules: [{ required: true, message: "Por favor entre com a cidade.", max: 45, }],
                            })(
                                <Input disabled={this.state.cepData.localidade || this.state.disabled} />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Bairro">
                            {getFieldDecorator('district', {
                                rules: [{ required: true, message: "Digite o bairro", max: 45, }],
                            })(
                                <Input disabled={this.state.cepData.bairro || this.state.disabled} />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Complemento">
                            {getFieldDecorator('complementaryAddress', {
                                rules: [{ required: false, max: 200, }],
                            })(
                                <Input disabled={this.state.disabled} />
                            )}
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Número">
                            {getFieldDecorator('number', {
                                rules: [{ required: true, message: "Digite o número", max: 45, }],
                            })(
                                <Input disabled={this.state.disabled} />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Estado">
                            {getFieldDecorator('state', {
                                rules: [{ required: true, message: "Por favor, entre com o estado.", max: 45, }],
                            })(
                                <Select
                                    disabled={this.state.cepData.uf || this.state.disabled}
                                >
                                    {stateOptions}
                                </Select>
                            )}
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="País">
                            {getFieldDecorator('country', {
                                rules: [{ required: true, message: "Por favor, entre com o país.", max: 45, }],
                            })(
                                <Input disabled={this.state.disabled} />
                            )}
                        </Form.Item>
                    </Col>
                </Row>


                <Form.Item label="Gerente">
                    {getFieldDecorator('generalManagerId', {
                        rules: [{ required: true, message: "Por favor, selecione o gerente." }],
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

                <Form.Item label="Funcionário Responsável">
                    {getFieldDecorator('responsibleEmployeeId', {
                        rules: [{ required: true, message: "Por favor, selecione o gerente." }],
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

                <Row type="flex" justify="start" gutter={16}>
                    <Col>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={this.state.disableSubmitButton}
                        >
                            Confirmar
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            onClick={() => this.props.form.resetFields()}
                        >
                            Limpar
                        </Button>
                    </Col>
                </Row>
            </Form>
        );
    }
}

AddMarket = Form.create({})(AddMarket);
