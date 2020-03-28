import React from 'react'
import { connect } from 'react-redux'
import {
  Icon,
  Modal,
  Table,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Breadcrumb,
  Tag
} from 'antd'
import { Link } from 'react-router-dom'

import './BooksComment.scss'
import { getCommentList, updateComment, deleteComment } from '../actions'
import { otherStatusList, otherStatusListText } from '../../../utils/constant'

import alert from '../../../utils/alert'
import faceqq from './qq'
const Option = Select.Option

const confirm = Modal.confirm
const { TextArea } = Input

class BooksComment extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          key: 'index',
          render: (text, record, index) => (
            <span
              style={{
                width: '20px',
                display: 'block'
              }}
            >
              {Number((this.state.pagination.current - 1) * 10) + index + 1}
            </span>
          )
        },
        {
          title: '评论内容',
          dataIndex: 'content',
          key: 'content',
          render: (text, record) => (
            <div
              dangerouslySetInnerHTML={{
                __html: this.commentRender(record.content)
              }}
            />
          )
        },
        {
          title: '来自小书',
          dataIndex: 'books',
          key: 'books',
          render: (text, record) => (
            <div>
              {record.books.title ? (
                <a href={`/book/${record.books.books_id}`} target="_block">
                  {record.books.title ? record.books.title : '-'}
                </a>
              ) : (
                  '-'
                )}
            </div>
          )
        },
        {
          title: '星级',
          dataIndex: 'star',
          key: 'star',
          render: (text, record) => {
            return Number(record.parent_id) < 1 ? (
              <div>{record.star}星</div>
            ) : (
                '子评论无需评星'
              )
          }
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          render: (text, record) => (
            <Tag className="table-books-tag-list" color="orange">
              {this.state.otherStatusListText[record.status]}
            </Tag>
          )
        },
        {
          title: '评论时间',
          dataIndex: 'create_dt',
          key: 'create_dt'
        },
        {
          title: '操作',
          key: 'action',
          render: (text, record) => {
            return (
              <div className="operation-btn">
                <button
                  onClick={() => {
                    this._edit(record)
                  }}
                  size="small"
                  className="btn btn-info"
                  type="primary"
                >
                  <Icon type="edit" />
                </button>
                <button
                  className="btn btn-light"
                  onClick={() => {
                    this._delete(record)
                  }}
                  size="small"
                >
                  <Icon type="delete" />
                </button>
              </div>
            )
          }
        }
      ],
      pagination: {
        current: 1
      },
      loading: false,
      modal_visible_edit: false,
      otherStatusList,
      otherStatusListText,
      content_val: '',
      status_val: ''
    }
  }

  componentDidMount () {
    this.fetchCommentList()
  }

  _edit = data => {
    /*修改标签*/
    this.setState({
      modal_visible_edit: true
    })
    this.props.dispatch({ type: 'SET_BOOKS_COMMENT_INFO', data: data })
    this.props.form.setFieldsValue({
      status: String(data.status)
    })
  }

  _delete = value => {
    this.props.dispatch({ type: 'SET_BOOKS_COMMENT_INFO', data: value })
    confirm({
      title: '确认要删除此条用户评论吗？',
      content: '此操作不可逆转',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        this.fetchDeleteComment({
          id: this.props.stateBooksComment.current_info.id
        })
        /*删除用户评论*/
      },
      onCancel () {
        console.log('Cancel')
      }
    })
  }

  commentRender = val => {
    console.log('val', val)
    let newComment = val
    faceqq.map(faceItem => {
      newComment = newComment.replace(
        new RegExp('\\' + faceItem.face_text, 'g'),
        faceItem.face_view
      )
    })
    return newComment
  }

  TablePageChange = async pages => {
    let pagination = {}
    pagination.current = pages.current
    await this.setState({
      pagination: {
        current: pages.current
      }
    })
    this.fetchCommentList(pages)
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
        this.fetchUpdateComment(values)
      }
    })
  }

  fetchUpdateComment = values => {
    /*修改用户评论*/
    this.props.dispatch(
      updateComment(
        { id: this.props.stateBooksComment.current_info.id, ...values },
        res => {
          alert.message_success('修改用户评论成功')
          this.fetchCommentList()
          this.setState({
            modal_visible_edit: false
          })
        }
      )
    )
  }

  getParams = () => {
    const { content_val, status_val } = this.state
    return {
      content: content_val,
      status: status_val
    }
  }

  changeVal = (val, type) => {
    let data = {}
    data[type] = val
    this.setState(data)
  }

  resetBarFrom = () => {
    const data = {
      content_val: '',
      status_val: ''
    }
    this.setState(data)
  }

  fetchDeleteComment = values => {
    /*删除用户评论*/
    this.props.dispatch(
      deleteComment(values, res => {
        alert.message_success('删除用户评论成功')
        this.fetchCommentList()
      })
    )
  }

  fetchCommentList = () => {
    /*获取用户评论带分页的列表*/
    let params = this.getParams()
    const that = this
    this.setState({ loading: true })
    const {
      pagination: { current }
    } = this.state
    this.props.dispatch(
      getCommentList({ page: current, ...params }, res => {
        let pagination = { ...that.state.pagination }
        pagination.total = res.count
        pagination.current = current
        that.setState({
          loading: false,
          pagination
        })
      })
    )
  }

  render () {
    const { stateBooksComment } = this.props
    const { loading, content_val, status_val } = this.state
    const { getFieldDecorator } = this.props.form

    const itemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 }
      }
    }
    const tailItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 5
        }
      }
    }

    return (
      <div className="layout-main">
        <div className="layout-main-title">
          <Breadcrumb>
            <Breadcrumb.Item href="#/manager/index">
              <Icon type="home" />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="#/manager/index">
              <span>主页</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item href="#">
              <span>小书管理</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>小书评论管理</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="xsb-operation-menu">
              <Form layout="inline">
                <Form.Item label="小书标题">
                  <Input
                    value={content_val}
                    onChange={e => {
                      this.changeVal(e.target.value, 'content_val')
                    }}
                  />
                </Form.Item>
                <Form.Item label="状态">
                  <Select
                    className="select-view"
                    value={status_val}
                    onChange={value => {
                      this.changeVal(value, 'status_val')
                    }}
                  >
                    <Option value="">全部</Option>
                    {Object.keys(this.state.otherStatusListText).map(key => (
                      <Option key={key}>
                        {this.state.otherStatusListText[key]}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <button
                    type="primary"
                    className="btn btn-danger"
                    onClick={this.fetchCommentList}
                  >
                    搜索
                  </button>
                  <button
                    type="primary"
                    className="btn btn-primary"
                    onClick={this.resetBarFrom}
                  >
                    重置
                  </button>
                </Form.Item>
              </Form>
            </div>

            <Table
              columns={this.state.columns}
              dataSource={stateBooksComment.list}
              loading={loading}
              onChange={this.TablePageChange.bind(this)}
              pagination={this.state.pagination}
              rowKey="id"
            />
          </div>
        </div>

        <Modal
          footer={null}
          onCancel={() => {
            this.setState({
              modal_visible_edit: false
            })
          }}
          title="修改"
          visible={this.state.modal_visible_edit}
        >
          <Form className="from-view" onSubmit={this.handleSubmit}>
            <Form.Item {...itemLayout} hasFeedback label="状态">
              {getFieldDecorator('status', {
                rules: [{ required: true, message: '请选择状态！' }]
              })(
                <Select placeholder="状态">
                  {Object.keys(this.state.otherStatusListText).map(key => (
                    <Option key={key}>
                      {this.state.otherStatusListText[key]}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>

            <Form.Item {...tailItemLayout}>
              <Button className="register-btn" htmlType="submit" type="primary">
                确定
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}

const BooksCommentForm = Form.create()(BooksComment)

export default connect(({ stateBooksComment }) => {
  return {
    stateBooksComment
  }
})(BooksCommentForm)
