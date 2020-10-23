import React from "react";
import { Icon, Row, Card, Col, Button, Drawer, message, Popconfirm, Tree, Select, Form, Input, Empty } from 'antd';
import { pathURL } from '../../servicesURL';
import { isJsonValid, handleErrorNotification } from '../../util/errorHandler';
import Cookies from 'js-cookie';
import MaskedInput from "react-text-mask";
import AddMarket from '../Structure/AddMarket';
import AddAisle from '../Structure/AddAisle';
import AddStorage from '../Structure/AddStorage';

const { TreeNode } = Tree;
const { Option } = Select

export default class Structure extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            companyId: sessionStorage.getItem('CompanyId'),
            selectedStructure: null,
            marketData: [],
            contactData: [],
            storageModelData: [],

            marketDrawer: false,
            storageDrawer: false,
            aisleDrawer: false,
            deleteDrawer: false,

            isEditing: false,
            disabled: true,
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

    getContacts = async () => {
        try {
            const port = '8083'
            const res = await fetch(pathSM + port + `/contact/find/companyId/${this.state.companyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': Cookies.get('dash-token')
                },
            })

            const json = await res.json();

            if (isJsonValid(json))
                this.setState({ contactData: json.contacts });
            else
                handleErrorNotification(json)

        } catch (error) {
            handleErrorNotification(error)
        }
    };

    getStructure = async () => {
        try {
            const port = '8084'
            const res = await fetch(pathSM + port + `/market/find/companyId/${this.state.companyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': Cookies.get('sm-token')
                },
            })

            const json = await res.json();


            if (isJsonValid(json))
                this.setState({ marketData: json.marketData });
            else
                handleErrorNotification(json)

        } catch (error) {
            handleErrorNotification(error)
        }
    };

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

    updateMarket = async (market) => {
        try {
            const port = "8084";
            const res = await fetch(pathSM + port + `/market/update/${market.marketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': Cookies.get('honey-token')
                }, body: JSON.stringify({
                    companyId: parseInt(this.state.companyId),
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

            const json = await res.json()

            if (isJsonValid(json)) {
                message.success('Editado com sucesso');
                this.reload();
            } else {
                handleErrorNotification(json)
            }

            this.setState({ isEditing: false, disabled: false, selectedStructure: null })

        } catch (error) {
            handleErrorNotification(error)
            this.setState({ isEditing: false, disabled: false, selectedStructure: null })
        }
    }

    updateAisle = async (aisle) => {
        try {
            const port = "8084"
            const res = await fetch(pathSM + port + `/aisle/update/${aisle.aisleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': Cookies.get('honey-token')
                }, body: JSON.stringify({
                    marketId: aisle.marketId,
                    name: aisle.name,
                    responsibleEmployeeId: aisle.responsibleEmployeeId,
                })
            })

            const json = await res.json()

            if (isJsonValid(json)) {
                message.success('Editado com sucesso');
                this.reload();
            } else {
                handleErrorNotification(json)
            }

            this.setState({ isEditing: false, disabled: false, selectedStructure: null })

        } catch (error) {
            handleErrorNotification(error)
            this.setState({ isEditing: false, disabled: false, selectedStructure: null })
        }
    }

    updateStorage = async (storage) => {
        try {
            const port = "8084";
            const res = await fetch(pathSM + port + `/storage/update/${storage.storageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'access-token': Cookies.get('honey-token')
                }, body: JSON.stringify({
                    aisleId: storage.aisleId,
                    storageModelId: storage.storageModelId,
                    name: storage.name,
                })
            })

            const json = await res.json()

            if (isJsonValid(json)) {
                message.success('Editado com sucesso');
                this.reload();
            } else {
                handleErrorNotification(json)
            }

            this.setState({ isEditing: false, disabled: false, selectedStructure: null })

        } catch (error) {
            handleErrorNotification(error)
            this.setState({ isEditing: false, disabled: false, selectedStructure: null })
        }
    }

    handleDeleteStructure = (e) => {
        e.preventDefault();
        const type = this.state.selectedStructure.slice(0,1);
        const id = this.state.selectedStructure.slice(1, this.state.selectedStructure.length);
        switch(type) {
            case 'm':
                this.deleteMarket(id);
                return;
            case 'a':
                this.deleteAisle(id);
                return;
            case 's':
                this.deleteStorage(id);
                return;
            default: return;
        }
    }

    async deleteMarket(marketId) {
        try {
            const res = await fetch( pathURL + `/structure/market/delete/`+marketId, {
                method: 'DELETE'
            });

            const json = await res.json();

            if (isJsonValid(json)) {
                message.success("Loja excluída com sucesso!");
            } else {
                handleErrorNotification(json);
            }

            this.reload();
            this.setState({ deleteDrawer: false, selectedStructure: null });
        } catch (error) {
            handleErrorNotification(error)
        }
    }

    async deleteAisle(aisleId) {
        try {
            const res = await fetch(pathURL + `/structure/aisle/delete/`+aisleId, {
                method: 'DELETE'
            });

            const json = await res.json();

            if (isJsonValid(json)) {
                message.success("Setor excluído com sucesso!");
            } else {
                handleErrorNotification(json);
            }

            this.reload();
            this.setState({ deleteDrawer: false, selectedStructure: null });
        } catch (error) {
            handleErrorNotification(error);
        }
    }

    async deleteStorage(storageId) {
        try {
            const res = await fetch(pathURL + `/structure/storage/delete/`+storageId, {
                method: 'DELETE'
            });

            const json = await res.json();

            if (isJsonValid(json)) {
                message.success("Refrigerador excluído com sucesso!");
            } else {
                handleErrorNotification(json);
            }

            this.reload();
            this.setState({ deleteDrawer: false, selectedStructure: null });

        } catch (error) {
            handleErrorNotification(error);
        }
    }

    handleCancel = (e) => {
        this.setState({
            isEditing: false,
            disabled: true,
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
        });
        this.props.form.resetFields();
    }

    onStructureSelect = (selectedKeys, info) => {
        this.setState({ selectedStructure: selectedKeys[0] })
        this.handleCancel();
    }

    showDrawerMarket = () => {
        this.setState({
            marketDrawer: true,
        });
    }

    showDrawerAisle = () => {
        this.setState({
            aisleDrawer: true,
        });
    }

    showDrawerStorage = () => {
        this.setState({
            storageDrawer: true,
        });
    }

    onCloseMarket = () => {
        this.setState({
            marketDrawer: false,
        });
    }

    onCloseAisle = () => {
        this.setState({
            aisleDrawer: false,
        });
    }

    onCloseStorage = () => {
        this.setState({
            storageDrawer: false,
        });
    }

    onCloseDelete = () => {
        this.setState({
            deleteDrawer: false,
        });
    }

    handleSubmitMarket = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.updateMarket(values);
            }
        });
    }

    handleSubmitAisle = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.updateAisle(values);
            }
        });
    }

    handleSubmitStorage = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.updateStorage(values);
            }
        });
    }

    loadData() {

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
        const selected1 = this.state.selectedStructure;

        if (selected1) {
            if (selected1[0] === 'm') {
                let selected;
                try {
                    selected = parseInt(selected1.substring(1, selected1.lenght));
                } catch (error) {
                    handleErrorNotification(error)
                }

                let dataMarket;
                this.state.marketData && this.state.marketData.length > 0 && this.state.marketData.map((market) =>
                    (market.marketId === selected)
                        ? dataMarket = market
                        : null
                );

                // string employeeName = dataMarket && this.state.contactData ? this.state.contactData.map((contact) => { dataMarket.responsibleEmployeeId == contact.contactId ? contact.name : "" }) : ""

                return (
                    <div>
                        <Form layout="horizontal">
                            <Row gutter={5}>
                                <Col span={20}>
                                    <Form.Item
                                        label={"Loja"}
                                    >
                                        {getFieldDecorator("name", {
                                            initialValue: dataMarket ? dataMarket.name : "",
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

                                <Col span={4}>
                                    <Form.Item label="ID">
                                        {getFieldDecorator("marketId", {
                                            initialValue: dataMarket ? dataMarket.marketId : "",
                                        })(
                                            <Input
                                                disabled={true}
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={5}>
                                <Col span={24}>
                                    <Form.Item
                                        label={"Razão Social"}
                                    >
                                        {getFieldDecorator("socialName", {
                                            initialValue: dataMarket ? dataMarket.socialName : "",
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
                                    <Form.Item label={"CNPJ"}>
                                        {getFieldDecorator('companyCode', {
                                            validateTrigger: 'onBlur',
                                            initialValue: dataMarket ? dataMarket.companyCode : "",
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
                                    <Form.Item label={"Telefone"}>
                                        {getFieldDecorator('phone', {
                                            initialValue: dataMarket ? dataMarket.phone : "",
                                            rules: [{
                                                required: false, pattern: /^\([1-9]{2}\) (?:[1-9]|[1-9][1-9])[0-9]{3}-[0-9]{4}$/,
                                                message: "Por favor, entre com o seu telefone."
                                            }],
                                        })(
                                            <MaskedInput
                                                mask={['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                                                className="ant-input"
                                                placeholder="(00) 0000-0000"
                                                disabled={this.state.disabled}
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Celular">
                                        {getFieldDecorator('mobilePhone', {
                                            initialValue: dataMarket ? dataMarket.mobilePhone : "",
                                            rules: [{
                                                required: false, pattern: /^\([1-9]{2}\) (?:[1-9]|[1-9][1-9])[0-9]{3}-[0-9]{4}$/,
                                                message: "Por favor, entre com o seu telefone."
                                            }],
                                        })(
                                            <MaskedInput
                                                mask={['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                                                className="ant-input"
                                                placeholder="(00) 00000-0000"
                                                disabled={this.state.disabled}
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label={"CEP"}>
                                        {getFieldDecorator('zipCode', {
                                            initialValue: dataMarket ? dataMarket.zipCode : "",
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
                                    <Form.Item label={"Endereço"}>
                                        {getFieldDecorator('address', {
                                            initialValue: dataMarket ? dataMarket.address : "",
                                            rules: [{ required: true, message: "Por favor, entre com o endereço.", max: 200, }],
                                        })(
                                            <Input disabled={this.state.cepData.logradouro || this.state.disabled} />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label={"Cidade"}>
                                        {getFieldDecorator('city', {
                                            initialValue: dataMarket ? dataMarket.city : "",
                                            rules: [{ required: true, message: "Por favor entre com a cidade.", max: 45, }],
                                        })(
                                            <Input disabled={this.state.cepData.localidade || this.state.disabled} />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Bairro">
                                        {getFieldDecorator('district', {
                                            initialValue: dataMarket ? dataMarket.district : "",
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
                                            initialValue: dataMarket ? dataMarket.complementaryAddress : "",
                                            rules: [{ required: false, max: 200, }],
                                        })(
                                            <Input disabled={this.state.disabled} />
                                        )}
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item label="Número">
                                        {getFieldDecorator('number', {
                                            initialValue: dataMarket ? JSON.stringify(dataMarket.number) : "",
                                            rules: [{ required: true, message: "Digite o número", max: 45, }],
                                        })(
                                            <Input disabled={this.state.disabled} />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label={"Estado"}>
                                        {getFieldDecorator('state', {
                                            initialValue: dataMarket ? dataMarket.state : "",
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
                                    <Form.Item label={"País"}>
                                        {getFieldDecorator('country', {
                                            initialValue: dataMarket ? dataMarket.country : "",
                                            rules: [{ required: true, message: "Por favor, entre com o país.", max: 45, }],
                                        })(
                                            <Input disabled={this.state.disabled} />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>


                            <Form.Item label={"Gerente"}>
                                {getFieldDecorator('generalManagerId', {
                                    initialValue: dataMarket ? dataMarket.generalManagerId : "",
                                    rules: [{ required: true, message: "Por favor, selecione o gerente." }],
                                })(
                                    <Select
                                        disabled={this.state.disabled}
                                    >
                                        {this.state.contactData.map((contact) => {
                                            return (
                                                <Option value={contact.contactId}>{contact.name}</Option>
                                            )
                                        })}
                                    </Select>
                                )}
                            </Form.Item>

                            <Form.Item label={"Funcionário Responsável"}>
                                {getFieldDecorator('responsibleEmployeeId', {
                                    initialValue: dataMarket ? dataMarket.responsibleEmployeeId : "",
                                    rules: [{ required: true, message: "Por favor, selecione o gerente." }],
                                })(
                                    <Select
                                        disabled={this.state.disabled}
                                    >
                                        {this.state.contactData.map((contact) => {
                                            return (
                                                <Option value={contact.contactId}>{contact.name}</Option>
                                            )
                                        })}
                                    </Select>
                                )}
                            </Form.Item>

                            {
                                this.state.isEditing ? (
                                    <div>
                                        <Row type="flex" justify="start" align='middle' gutter={8}>
                                            <Col>
                                                <Button type='primary' htmltype='submit' onClick={this.handleSubmitMarket}>Salvar Alterações</Button>
                                            </Col>
                                            <Col>
                                                <Button onClick={this.handleCancel}>Cancelar</Button>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : (
                                        <Button type="primary" onClick={this.handleEdit}>Editar dados</Button>
                                    )}
                        </Form>
                    </div>
                )
            }
            if (selected1[0] === 'a') {
                let selected;
                try {
                    selected = parseInt(selected1.substring(1, selected1.lenght));
                } catch (error) {
                    handleErrorNotification(error)
                }

                let dataAisle, dataMarket;

                this.state.marketData.forEach((market) => market.aisles.forEach((aisle) => {
                    if (aisle.aisleId === selected) {
                        dataMarket = market;
                        dataAisle = aisle;
                    }
                }))

                return (
                    <div>
                        <Form layout="horizontal" >

                            <Row gutter={5}>
                                <Col span={20}>
                                    <Form.Item
                                        label={"Loja"}
                                    >
                                        {getFieldDecorator("marketName", {
                                            initialValue: dataMarket ? dataMarket.name : "",
                                            rules: [
                                                {
                                                    required: true,
                                                }
                                            ]
                                        })(
                                            <Input
                                                disabled={true}
                                                prefix={
                                                    <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                                                }
                                            />
                                        )}
                                    </Form.Item>
                                </Col>

                                <Col span={4}>
                                    <Form.Item label="ID">
                                        {getFieldDecorator("marketId", {
                                            initialValue: dataMarket ? dataMarket.marketId : "",
                                        })(
                                            <Input
                                                disabled={true}

                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={5}>
                                <Col span={20}>
                                    <Form.Item
                                        label={"Setor"}
                                    >
                                        {getFieldDecorator("name", {
                                            initialValue: dataAisle ? dataAisle.name : "",
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

                                <Col span={4}>
                                    <Form.Item label="ID">
                                        {getFieldDecorator("aisleId", {
                                            initialValue: dataAisle ? dataAisle.aisleId : "",
                                        })(
                                            <Input
                                                disabled={true}

                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label={"Funcionário Responsável"}>
                                {getFieldDecorator('responsibleEmployeeId', {
                                    initialValue: dataAisle ? dataAisle.responsibleEmployeeId : "",
                                    rules: [{ required: true, message: "Por favor, selecione o funcionário responsável." }],
                                })(
                                    <Select
                                        disabled={this.state.disabled}
                                    >
                                        {this.state.contactData.map((contact) => {
                                            return (
                                                <Option value={contact.contactId}>{contact.name}</Option>
                                            )
                                        })}
                                    </Select>
                                )}
                            </Form.Item>

                            {
                                this.state.isEditing ? (
                                    <div>
                                        <Row type="flex" justify="start" align='middle' gutter={8}>
                                            <Col>
                                                <Button type='primary' htmltype='submit' onClick={this.handleSubmitAisle}>Salvar Alterações</Button>
                                            </Col>
                                            <Col>
                                                <Button onClick={this.handleCancel}>Cancelar</Button>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : (
                                        <Button type="primary" onClick={this.handleEdit}>Editar dados</Button>
                                    )}
                        </Form>
                    </div>
                )
            }
            if (selected1[0] === 's') {
                let selected;
                try {
                    selected = parseInt(selected1.substring(1, selected1.lenght));
                } catch (error) {
                    handleErrorNotification(error)
                }

                let dataStorage, dataAisle, dataMarket;
                this.state.marketData.forEach((market) => market.aisles.forEach((aisle) => aisle.storages.forEach((storage) => {
                    if (storage.storageId === selected) {
                        dataStorage = storage;
                        dataAisle = aisle;
                        dataMarket = market;
                    }
                })));

                return (
                    <div>
                        <Form layout="horizontal">
                            <Row gutter={5}>
                                <Col span={20}>
                                    <Form.Item
                                        label={"Refrigerador"}
                                    >
                                        {getFieldDecorator('name', {
                                            initialValue: dataStorage ? dataStorage.name : "",
                                            rules: [{ required: true, message: "Por favor, entre com o nome." }],
                                        })(
                                            <Input disabled={this.state.disabled} />
                                        )}
                                    </Form.Item>
                                </Col>

                                <Col span={4}>
                                    <Form.Item label="ID">
                                        {getFieldDecorator("storageId", {
                                            initialValue: dataStorage ? dataStorage.storageId : "",
                                        })(
                                            <Input
                                                disabled={true}
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={5}>
                                <Col span={20}>
                                    <Form.Item
                                        label={"Setor"}
                                    >
                                        {getFieldDecorator('aisleName', {
                                            initialValue: dataAisle ? dataAisle.name : "",
                                            rules: [{ required: true, message: "Por favor, entre com o nome." }],
                                        })(
                                            <Input disabled={true} />
                                        )}
                                    </Form.Item>
                                </Col>

                                <Col span={4}>
                                    <Form.Item label="ID">
                                        {getFieldDecorator("aisleId", {
                                            initialValue: dataStorage ? dataStorage.aisleId : "",
                                        })(
                                            <Input
                                                disabled={true}
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label={"Modelo de Refrigerador"}>
                                {getFieldDecorator('storageModelId', {
                                    initialValue: dataStorage ? dataStorage.storageModelId : "",
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


                            {
                                this.state.isEditing ? (
                                    <div>
                                        <Row type="flex" justify="start" align='middle' gutter={8}>
                                            <Col>
                                                <Button type='primary' htmltype='submit' onClick={this.handleSubmitStorage}>Salvar Alterações></Button>
                                            </Col>
                                            <Col>
                                                <Button onClick={this.handleCancel}>Cancelar</Button>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : (
                                        <Button type="primary" onClick={this.handleEdit}>Editar dados</Button>
                                    )}
                        </Form>
                    </div>
                )
            }
        }
        else {
            return (
                <div>
                    <Empty />
                </div>
            )
        }
    }

    deleteStructure(value) {
        if (!(value && value.length > 0))
            return;
        if (value.length === 3) {
            this.deleteStorage(value[2]);
        } else if (value.length === 2) {
            this.deleteAisle(value[1]);
        } else {
            this.deleteMarket(value[0]);
        }
    }

    handleEdit = () => {
        this.setState({
            isEditing: true,
            disabled: false,
        });
    }

    reload = () => {
        this.onCloseMarket();
        this.onCloseAisle();
        this.onCloseStorage();
        this.getStructure();
        this.getContacts();
        this.getAllStorageModel();
        this.props.reload();
    }

    componentDidMount() {
        this.getStructure();
        this.getContacts();
        this.getAllStorageModel();
    };


    render() {

        return (
            <div>
                <Card
                    title={
                    <div>
                        <span className="hon-h1" style={{ display: 'block' }}>Estrutura</span>
                        <span style={{ display: 'block', fontFamily: 'HoneywellSansWeb-Medium', fontWeight: 400, marginLeft: '1rem', lineHeight: 2 }}>Selecione uma estrutura no menu para mais detalhes e ações</span>
                    </div>
                    }
                    extra={
                        <Row type="flex" justify="space-between" gutter={16}>
                            <Col>
                                <Button type="primary" icon="plus" onClick={() => this.showDrawerMarket()}>Loja</Button>
                            </Col>
                            <Col>
                                <Button type="primary" icon="plus" onClick={() => this.showDrawerAisle()}>Setor</Button>
                            </Col>
                            <Col>
                                <Button type="primary" icon="plus" onClick={() => this.showDrawerStorage()}>Refrigerador</Button>
                            </Col>
                        </Row>
                    }
                    bordered={false}
                    headStyle={{ border: 0 }}
                >
                    <Row gutter={10} style={{ marginTop: '.5rem' }}>
                        <Col span={12}>
                            <Card
                                title={<h3>Menu</h3>}
                            >
                                {(this.state.marketData && this.state.marketData.length > 0) &&
                                    <Tree
                                        onSelect={(selected) => this.onStructureSelect(selected)}
                                        defaultExpandedKeys={this.state.marketData.reduce(function(acc, m) { acc.push('m'+m.marketId); return acc }, [])}
                                    >
                                        {this.state.marketData.map((market) => {
                                            return (
                                                <TreeNode
                                                    title={market.name}
                                                    key={'m' + market.marketId}
                                                    selectable={true}
                                                >
                                                    {
                                                        market.aisles.map((aisle) => {
                                                            return (
                                                                <TreeNode 
                                                                    title={aisle.name} 
                                                                    key={'a' + aisle.aisleId} 
                                                                    selectable={true}
                                                                >
                                                                    {
                                                                        aisle.storages.map((storage) => {
                                                                            return (
                                                                                <TreeNode 
                                                                                    title={storage.name} 
                                                                                    key={'s' + storage.storageId} 
                                                                                    isLeaf 
                                                                                />
                                                                            )
                                                                        })
                                                                    }
                                                                </TreeNode>
                                                            )
                                                        })
                                                    }
                                                </TreeNode>
                                            )
                                        })}
                                    </Tree>}
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card
                                title={<h3>Detalhes</h3>}
                                extra={this.state.selectedStructure &&
                                <Popconfirm
                                    title="Deseja realmente excluir? Esta ação é irreversível."
                                    placement="left"
                                    onConfirm={this.handleDeleteStructure}
                                    okText="Sim"
                                    cancelText="Não"
                                ><Button type="danger">Excluir</Button></Popconfirm>
                                }>
                                { this.loadData() }
                            </Card>
                        </Col>
                    </Row>
                </Card>

                <Row>
                    <Row style={{ margin: '10px' }}>
                        <Drawer
                            title={<h2>Adicionar Loja</h2>}
                            placement="right"
                            width={720}
                            closable={false}
                            onClose={this.onCloseMarket}
                            visible={this.state.marketDrawer}
                        >
                            <AddMarket companyId={this.state.companyId} marketData={this.state.marketData} contactData={this.state.contactData} reload={this.reload} />
                        </Drawer>
                    </Row>

                    <Row style={{ margin: '10px' }}>
                        <Drawer
                            title={<h2>Adicionar Setor</h2>}
                            placement="right"
                            width={720}
                            closable={false}
                            onClose={this.onCloseAisle}
                            visible={this.state.aisleDrawer}
                        >
                            <AddAisle companyId={this.state.companyId} marketData={this.state.marketData} contactData={this.state.contactData} reload={this.reload} />
                        </Drawer>
                    </Row>
                    <Row style={{ margin: '10px' }}>
                        <Drawer
                            title={<h2>Adicionar Refrigerador</h2>}
                            placement="right"
                            width={720}
                            closable={false}
                            onClose={this.onCloseStorage}
                            visible={this.state.storageDrawer}
                        >
                            <AddStorage companyId={this.state.companyId} marketData={this.state.marketData} contactData={this.state.contactData} reload={this.reload} />
                        </Drawer>
                    </Row>
                </Row>
            </div>
        );
    }
}

Structure = Form.create({})(Structure);
