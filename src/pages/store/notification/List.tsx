import React from 'react'
// @ts-ignore
import Dashboard from '@layouts/Dashboard'
// @ts-ignore
import ToolBar from '@components/toolbar/ToolBar'
// @ts-ignore
import WithDva from 'dva-utils/store'
import { Table, Button, Modal, Form, Input, Popconfirm } from 'antd'
import { FormComponentProps } from 'antd/lib/form'

import { ColumnProps } from 'antd/lib/table'
import './List.style.less'
import Category from '../../../class/Category'
import { API_CLASS_NAME } from '../../../constants/className'
const FormItem = Form.Item

const showButtons = [
  {
    id: 1,
    text: 'New'
  },
  {
    id: 2,
    text: 'Edit'
  },
  {
    id: 3,
    text: 'Delete'
  },
  {
    id: 4,
    text: 'Unselect All'
  }
]

interface CollectionCreateFormProps extends FormComponentProps {
  visible: boolean
  onCancel: any
  onCreate: any
  currentCategory: Category
}
const CollectionCreateForm = Form.create()(
  class extends React.Component<CollectionCreateFormProps, any> {
    render() {
      const { visible, onCancel, onCreate, form } = this.props
      const { getFieldDecorator } = form
      return (
        <Modal
          visible={visible}
          title="新建分类"
          okText="新建"
          cancelText="取消"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="名称">
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: '名称为必填项目'
                  }
                ]
              })(<Input />)}
            </FormItem>
            <FormItem label="排序">
              {getFieldDecorator('sort')(<Input />)}
            </FormItem>
          </Form>
        </Modal>
      )
    }
  }
)

interface CategoryListPageProps {
  goods: any
  api: any
  dispatch: any
}

@WithDva(({ api }) => {
  return { api }
})
export default class CategoryListPage extends React.Component<
  CategoryListPageProps,
  any
> {
  state = {
    visible: false
  }

  formRef: Form

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { dispatch } = this.props

    dispatch({
      type: 'api/getList',
      payload: {
        className: API_CLASS_NAME.CATEGORY
      }
    })
  }

  showModal = (item?: Category) => {
    const { dispatch } = this.props
    dispatch({
      type: 'api/updateCurrent',
      payload: { params: item ? item : {}, className: API_CLASS_NAME.CATEGORY }
    })
    // set value
    if (this.formRef) {
      this.formRef.props.form.setFieldsValue({
        name: item ? item.name : '',
        sort: item ? item.sort : ''
      })
    }

    this.setState({ visible: true })
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { dispatch } = this.props
    let current = pagination.current

    dispatch({
      type: 'api/getList',
      payload: {
        className: API_CLASS_NAME.CATEGORY,
        params: current
      }
    })
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  handleDelete = item => {
    const { dispatch } = this.props
    dispatch({
      type: 'api/delete',
      payload: { params: item, className: API_CLASS_NAME.CATEGORY }
    })
  }

  handleCreate = () => {
    const form = this.formRef.props.form
    form.validateFields((err, values) => {
      if (err) {
        return
      }

      const { dispatch } = this.props

      let category: Category = {
        name: values.name,
        sort: values.sort
      }

      dispatch({
        type: 'api/create',
        payload: {
          params: category,
          className: API_CLASS_NAME.CATEGORY
        }
      })

      console.log('Received values of form: ', values)

      form.resetFields()
      this.setState({ visible: false })
    })
  }

  saveFormRef = formRef => {
    this.formRef = formRef
  }

  columns = (): Array<ColumnProps<Category>> => {
    return [
      { title: 'ID', dataIndex: 'objectId', key: 'objectId' },
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '排序', dataIndex: 'sort', key: 'sort' },
      {
        title: '操作',
        key: 'x',
        render: item => (
          <p>
            <a
              onClick={() => {
                this.showModal(item)
              }}
            >
              编辑
            </a>
            <Popconfirm
              title="您确认删除该分类了吗？"
              onConfirm={() => {
                this.handleDelete(item)
              }}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ marginLeft: 10 }}>删除</a>
            </Popconfirm>
          </p>
        )
      }
    ]
  }

  render() {
    let categoryList = this.props.api[API_CLASS_NAME.CATEGORY + 'List']
    let categoryCount = this.props.api[API_CLASS_NAME.CATEGORY + 'Count']
    let currentCategory = this.props.api[API_CLASS_NAME.CATEGORY + 'Current']

    return (
      <Dashboard>
        <div>
          <ToolBar
            showButtons={showButtons}
            onButtonClicked={id => {
              switch (id) {
                case 1:
                  this.setState({
                    isEditDialogShow: true
                  })
                  break
              }
            }}
            search={key => alert(key)}
          />
          <Table
            className="table"
            columns={this.columns()}
            dataSource={categoryList}
            pagination={{
              total: categoryCount
            }}
            rowKey={(item: Category) => {
              return item.objectId
            }}
            onChange={this.handleTableChange}
          />
          <CollectionCreateForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
            currentCategory={currentCategory}
          />
        </div>
      </Dashboard>
    )
  }
}
