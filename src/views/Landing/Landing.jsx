import React from 'react';
import { Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Structure from '../../components/Structure/Structure';

import 'antd/dist/antd.css';


const Landing = () => {
    
    return (
        <Card
            headStyle={{ border: 0 }}
            title={<h3>Gerenciar Espaços</h3>}
            bodyStyle={{ boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}
            extra={
                <Button type="primary"><PlusOutlined style={{ verticalAlign: 'middle', fontSize: '1rem' }} />Adicionar Espaços</Button>
            }
        >
            <Structure/>
        </Card>
    );
}

export default Landing;
