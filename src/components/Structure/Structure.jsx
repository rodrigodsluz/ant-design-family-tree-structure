import React from 'react';
import { Row, Card, Col, Tree } from 'antd';
import { structureData } from '../../mock/structure';
import SpaceTable from '../../components/SpaceTable/SpaceTable';
/*import { findContactByCompany } from '../../services/contact'; */

import 'antd/dist/antd.css';


const { TreeNode } = Tree;

const Structure = () => {

   /*  const [form] = Form.useForm();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isCancelled = false;
        getContactsFromCompany(isCancelled);
        return () => (isCancelled = true)
    }, []);

    const getContactsFromCompany = async (isCancelled) => {
        const companyId = JSON.parse(sessionStorage.getItem('contactData')).companyId;
        const json = await findContactByCompany(companyId);
        if (!isCancelled) {
            if (json.Status && json.contacts){
                setData(json.contacts);

                console.log(json.contacts);
            }
            else
                notification.error({ message: 'Erro', description: json.Message || "Falha em carregar dados." });
        }
    }; */

/*         const data = [{name: 1, address: 3}, {name: 1, address: 3}, {name: 1, address: 3}]
 */
        return(
            <Row gutter={10} style={{ marginTop: '.5rem' }}>
                <Col span={5}>
                    <Card
                        title={<h3>Menu</h3>}
                    >
                        {(structureData && structureData.length > 0) &&
                            <Tree
                                defaultExpandedKeys={structureData.reduce(function(acc, regiao) { acc.push('regiao'+regiao.regionId); return acc }, [])}
                            >
                                {structureData.map((region) => {
                                    return (
                                        <TreeNode
                                            title={region.name}
                                            key={'regiao' + region.regionId}
                                            selectable={true}
                                        >
                                            {
                                                region.plants.map((plants) => {
                                                    return (
                                                        <TreeNode 
                                                            title={plants.name} 
                                                            key={'plant' + plants.plantId} 
                                                            selectable={true}
                                                        >
                                                            {
                                                                plants.spaces.map((spaces) => {
                                                                    return (
                                                                        <TreeNode 
                                                                            title={spaces.name} 
                                                                            key={'s' + spaces.spaceId} 
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

                <Col span={19}>
                            <Card
                                title={<h3>Histórico de sessões</h3>}
                            >
                                <SpaceTable data={structureData} />
                            </Card>
                        </Col>
            </Row>
        );
    }
    
export default Structure;
