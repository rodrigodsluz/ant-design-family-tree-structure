import React from 'react';
import { Table, Tag, Space } from 'antd';

const SpaceTable = (props) => {
    return (
        <Table
            bordered={false}
            rowClassName={(record, index) => (index % 2 !== 0) ? 'table-row-odd' : ''}
            columns={[
                {
                    title: 'Nome',
                    key: 'name',
                    render: (name, record, index) => `${record.name} ${record.lastName}`
                },
                {
                    title: 'Data da sessão',
                    dataIndex: 'department',
                    key: 'department',
                },
                {
                    title: 'Horário de início',
                    dataIndex: 'position',
                    key: 'position',
                },
                {
                  title: 'Horário de finalização',
                  dataIndex: 'position',
                  key: 'position',
              },
                {
                    title: 'Tags',
                    render: (login, record, index) => <Space>
                        <Tag color="#1d7524" >Visual</Tag>
                        <Tag color="#0011ff" >Audible</Tag>
                        <Tag color="#e60606" >H2S</Tag>
                        <Tag color="#0acece" >CO</Tag>
                        <Tag color="#db6d12" >LEL</Tag>
                        <Tag color="#8f129b" >O2</Tag>
                    </Space>

                },
                
            ]}
            dataSource={props.data}
        />
    );
}

export default SpaceTable;
