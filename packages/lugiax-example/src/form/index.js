import React, { Component, } from 'react';
import styled from 'styled-components';
import { connect, } from '@lugia/lugiax';
import Widget from '@lugia/lugia-web/dist/consts';
import {
  Theme,
  Tabs,
  Avatar,
  Input,
  Button,
  Select,
  Icon,
  DatePicker,
  Divider,
  Radio,
  Card,
  Grid,
  Tooltip,
  AutoComplete,
  Table,
  TimePicker,
} from '@lugia/lugia-web';

import Content from './components/content';
import PageContent from './components/page-content';
import advanced from './models/advanced';

const { Row, Col, } = Grid;
const { RangePicker, } = DatePicker;

const ItemContainer = styled.div`
  position: relative;
  height: auto;
  zoom: 1;
  display: inline-block;
  box-sizing: border-box;
  padding: 5px 0;
`;

const ItemInnerContainer = styled.div`
  box-sizing: border-box;
  margin-right: 5px;
`;
const ItemInputContainer = styled.div`
  display: inline-block;
  box-sizing: border-box;
`;
const TitleContainer = styled.label`
  position: relative;
  height: 25px;
  line-height: 25px;
  display: inline-block;
`;
const TitleText = styled.span`
  position: relative;
  display: inline-block;
  height: 25px;
  line-height: 25px;
`;
const SelectContainer = styled.div`
  vertical-align: bottom;
  display: inline-block;
`;

class TableList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getData();
  }

  addPersonnel = () => {
    this.props.addPersonnel();
  };

  deletePersonnel = data => {
    this.props.deletePersonnel(data.id);
  };

  render() {
    const { onNameChange, onIpAddressChange, onManageChange, } = this.props;

    const nameData = [
      {
        title: '成员名称:',
        placeholder: '请输成员名称',
        onChange: onNameChange,
      },
    ];

    const ipData = [
      {
        title: '工号:',
        placeholder: '请输入工号',
        isAuto: true,
        onChange: onIpAddressChange,
      },
    ];
    const managerData = [
      {
        title: '所属部门',
        isSelect: true,
        selectData: [
          { value: '部门1', label: '部门1', },
          { value: '部门2', label: '部门2', },
          { value: '部门3', label: '部门3', },
          { value: '部门4', label: '部门4', },
        ],
        selectView: {
          [Widget.Select]: {
            Container: {
              normal: {
                width: 200,
              },
            },
          },
        },
        placeholder: '请选择所属部门',
        onChange: onManageChange,
      },
    ];

    const inputView = {
      [Widget.Input]: {
        Container: {
          normal: {
            width: 200,
          },
        },
      },
    };

    const getDataItem = (
      <ItemContainer>
        <ItemInnerContainer>
          <TitleContainer>
            <TitleText>{'生效日期'}</TitleText>
          </TitleContainer>
        </ItemInnerContainer>
        <ItemInputContainer>
          <RangePicker format={'YYYY-MM-DD'} />
        </ItemInputContainer>
      </ItemContainer>
    );
    const getWorkDataItem = (
      <ItemContainer>
        <ItemInnerContainer>
          <TitleContainer>
            <TitleText>{'生效日期'}</TitleText>
          </TitleContainer>
        </ItemInnerContainer>
        <ItemInputContainer>
          <TimePicker />
        </ItemInputContainer>
      </ItemContainer>
    );

    const getItem = data => () => {
      return data.map(item => {
        const {
          title,
          placeholder,
          isSelect,
          selectData,
          selectView,
          isAuto,
          onChange,
        } = item;
        return (
          <ItemContainer>
            <ItemInnerContainer>
              <TitleContainer>
                <TitleText>{title}</TitleText>
              </TitleContainer>
            </ItemInnerContainer>
            <ItemInputContainer>
              {!isSelect && !isAuto && (
                <Theme config={inputView}>
                  <Input placeholder={placeholder} onChange={onChange} />
                </Theme>
              )}
              {isAuto && (
                <Theme config={inputView}>
                  <AutoComplete placeholder={placeholder} onChange={onChange} />
                </Theme>
              )}
              {isSelect && (
                <Theme config={selectView}>
                  <SelectContainer>
                    <Select
                      createPortal
                      data={selectData}
                      displayField={'label'}
                      placeholder={placeholder}
                      onChange={onChange}
                    />
                  </SelectContainer>
                </Theme>
              )}
            </ItemInputContainer>
          </ItemContainer>
        );
      });
    };
    const cardThemeConfig = {
      [Widget.Card]: {
        Container: {
          normal: {
            width: '100%',
            height: 190,
            margin: {
              bottom: 30,
            },
          },
        },
        CardTitle: {
          normal: {
            height: 30,
            margin: {
              top: 20,
              left: 10,
            },
          },
        },
        CardContent: {
          normal: {
            padding: 0,
          },
        },
      },
      [Widget.Select]: {
        Container: {
          normal: {
            width: 200,
          },
        },
      },
    };
    const staffCardThemeConfig = {
      [Widget.Card]: {
        Container: {
          normal: {
            width: '100%',
          },
        },
        CardTitle: {
          normal: {
            height: 30,
            margin: {
              top: 20,
              left: 10,
            },
          },
        },
        CardContent: {
          normal: {
            padding: 0,
          },
        },
      },
    };

    const tableTitle = [
      {
        title: '成员名字',
        dataIndex: 'name',
        key: 'name',
        width: 100,
      },
      {
        title: '工号',
        dataIndex: 'id',
        key: 'id',
        width: 100,
      },
      {
        title: '所属部门',
        dataIndex: 'address',
        key: 'address',
        width: 200,
      },
      {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        render: (data, data1, data2) => {
          return (
            <a
              onClick={() => {
                this.deletePersonnel(data1);
              }}
            >
              删除{data}
            </a>
          );
        },
      },
    ];

    const { personnelList, taskInfo, } = this.props;
    return (
      <Content>
        <PageContent>
          <Theme config={cardThemeConfig}>
            <Card
              title={'仓库管理'}
              content={
                <PageContent>
                  <Row>
                    <Col span={6}>{getItem(nameData)()}</Col>
                    <Col span={6} offset={2}>
                      {getItem(ipData)()}
                    </Col>
                    <Col span={6} offset={2}>
                      {getItem(managerData)()}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4} offset={20}>
                      <Button type="primary" onClick={this.addPersonnel}>
                        添加
                      </Button>
                    </Col>
                  </Row>
                </PageContent>
              }
            />
          </Theme>
          <Theme config={staffCardThemeConfig}>
            <Card
              title={'成员管理'}
              content={
                <PageContent>
                  <Table columns={tableTitle} data={personnelList} />
                </PageContent>
              }
            />
          </Theme>
        </PageContent>
      </Content>
    );
  }
}

const AdvancedFormPage = connect(
  advanced,
  state => {
    return {
      tableTitle: state.get('tableTitle').toJS
        ? state.get('tableTitle').toJS()
        : state.get('tableTitle'),
      personnelList: state.get('personnelList').toJS
        ? state.get('personnelList').toJS()
        : state.get('personnelList'),
      saveInfo: state.get('saveInfo').toJS
        ? state.get('saveInfo').toJS()
        : state.get('saveInfo'),
    };
  },
  mutations => {
    return {
      getData: mutations.asyncGetList,
      onNameChange: mutations.onNameChange,
      onIpAddressChange: mutations.onIpAddressChange,
      onManageChange: mutations.onManageChange,
      addPersonnel: mutations.addPersonnel,
      deletePersonnel: mutations.deletePersonnel,
    };
  }
)(TableList);

export default () => {
  return <AdvancedFormPage />;
};
