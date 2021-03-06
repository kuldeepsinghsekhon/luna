import React from 'react'
import {NavLink, Link} from 'react-router-dom'

import _ from 'lodash'

import {
        Dialog,
        Button,
        Checkbox,
      } from "@blueprintjs/core"

import Admin from '../../layouts/admin'
import {RoleService, PermissionService} from '../../services'
import Pagination from "react-js-pagination"
import moment from "moment"
import { Toast } from '../../common/toaster'

// CASL
import { Can, CanWithLoader } from '../../utils/casl/ability-context'

class Page extends React.Component {

    constructor(props) {
        super(props);

        const roles = [{name: '-----'},{name: '---'},{name: '---------'},];

        this.state = {
            roles: roles,
            pagination: {},
            loading: false,
            filterRole: null,
            filterPermission: null,
            addMoreRoleDialogOpen: false,
            addMorePermissionDialogOpen: false,
            checkingAuth: this.props.checkingAuth,
        }

        this.filterPermissions = this.filterPermissions.bind(this);
        this.filterRoles = this.filterRoles.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.handleRoleSubmit = this.handleRoleSubmit.bind(this);
        this.handlePermissionSubmit = this.handlePermissionSubmit.bind(this);
    }

    componentDidMount() {
        this.fetchRoles();
    }


    componentWillReceiveProps(nextProps) {

        // Update checking auth boolean
        this.setState({checkingAuth: this.props.checkingAuth});
    }


    fetchRoles(page = '') {

        const { dispatch } = this.props
        if (page) this.props.history.push('?page='+page);

        const { search } = this.props.history.location
        if (search) page = search.split('=')[1];

        this.setState({ loading: true });

        dispatch(RoleService.getRoles(page))
            .then((result)  => {
                this.setState({
                    roles: result.roles.data,
                    pagination: {
                        links: result.roles.links,
                        meta: result.roles.meta,
                    },
                    permissions: result.permissions,
                });
                this.setState({ loading: false });
            })
            .catch(({error, statusCode}) => {
                // console.log(error)
            })
    }

    handleChange({target}, id, role_id) {
        const { dispatch } = this.props

        dispatch(PermissionService.changePermission({id: id, checked: target.checked, role_id: role_id, method: 'changePermission'}))
            .then((result)  => {
                Toast.show({message: "Successfully, "+(target.checked ? 'added':'removed')+" '"+result.name+"'", icon: "info-sign", intent: "success"});
            })
            .catch(({error, statusCode}) => {
                target.checked = !target.checked
                Toast.show({message: "Failed to change permission!", icon: "warning-sign", intent: "warning"});
            })
    }

    openAddMoreRoleDialog() {
        console.log('open role dialog')
        this.setState({addMoreRoleDialogOpen: true});
    }

    openAddMorePermissionDialog() {
        console.log('open permission dialog')
        this.setState({addMorePermissionDialogOpen: true});
    }

    handleRoleSubmit(event) {

        const { dispatch } = this.props

        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);

        for (let name of data.keys()) {
          const input = form.elements[name];

          if (input.checkValidity()) {
            this.setState({ [name+"_error"]: false });

            dispatch(RoleService.create({name: input.value}))
                .then((result)  => {
                    // Toast.show({message: "Successfully, "+(target.checked ? 'added':'removed')+" '"+result.name+"'", icon: "info-sign", intent: "success"});
                })
                .catch((error) => {
                    // Toast.show({message: "Failed to change permission!", icon: "warning-sign", intent: "warning"});
                })
          } else {
            this.setState({ [name+"_error"]: true });
          }
        }

    }

    handlePermissionSubmit(event) {

        const { dispatch } = this.props

        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);

        for (let name of data.keys()) {
          const input = form.elements[name];

          if (input.checkValidity()) {
            this.setState({ [name+"_error"]: false });

            dispatch(PermissionService.create({name: input.value}))
                .then((res)  => {
                    console.log(res);
                    // Toast.show({message: "Successfully, "+(target.checked ? 'added':'removed')+" '"+result.name+"'", icon: "info-sign", intent: "success"});
                })
                .catch((err) => {
                    // Toast.show({message: "Failed to change permission!", icon: "warning-sign", intent: "warning"});
                })
          } else {
            this.setState({ [name+"_error"]: true });
          }
        }

    }

    filterRoles(event) {

        const value = event.target.value

        this.setState({filterRole: value})
    }

    filterPermissions(event) {

        const value = event.target.value

        this.setState({filterPermission: value})
    }

    render() {

        const addMoreRoleDialog = (
            <Dialog title="Create role"
                    isOpen={this.state.addMoreRoleDialogOpen}
                    onClose={ () => {this.setState({addMoreRoleDialogOpen: false})} }
                    canEscapeKeyClose="false"
                    canOutsideClickClose="false"
                    isCloseButtonShown="false"
                    icon="add">
                <form onSubmit={this.handleRoleSubmit} name="FormRole" noValidate>
                    <div className="bp3-dialog-body">
                        <input type="text" className={(this.state.role_error ? "bp3-intent-danger" : '') +" bp3-input"} name="role" placeholder="New Role" required />
                        <small className={this.state.role_error ? "d-absolute m-2 text-danger" : 'd-none text-danger'}>Don't leave this blank.</small>
                    </div>
                    <div className="bp3-dialog-footer">
                        <div className="bp3-dialog-footer-actions">
                            <button className="bp3-button" type="submit">Submit</button>
                            <button type="button" className="bp3-button bp3-intent-primary" onClick={ () => {this.setState({addMoreRoleDialogOpen: false})} }>Cancel</button>
                        </div>
                    </div>
                </form>
            </Dialog>
            )

        const addMorePermissionDialog = (
            <Dialog title="Create permission"
                    isOpen={this.state.addMorePermissionDialogOpen}
                    onClose={ () => {this.setState({addMorePermissionDialogOpen: false})} }
                    canEscapeKeyClose="false"
                    canOutsideClickClose="false"
                    isCloseButtonShown="false"
                    icon="add">
                <form onSubmit={this.handlePermissionSubmit} name="FormPermission" noValidate>
                    <div className="bp3-dialog-body">
                            <input type="text" className={(this.state.permission_error ? "bp3-intent-danger" : '') +" bp3-input"} name="permission" placeholder="New Permission" required />
                            <small className={this.state.permission_error ? "d-absolute m-2 text-danger" : 'd-none text-danger'}>Don't leave this blank.</small>
                    </div>
                    <div className="bp3-dialog-footer">
                        <div className="bp3-dialog-footer-actions">
                            <button className="bp3-button" type="submit">Submit</button>
                            <button type="button" className="bp3-button bp3-intent-primary" onClick={ () => {this.setState({addMorePermissionDialogOpen: false})} }>Cancel</button>
                        </div>
                    </div>
                </form>
            </Dialog>
            )

        return (

            <Admin path={this.props.location.pathname}>
                {addMoreRoleDialog}
                {addMorePermissionDialog}

                <h4 className="mb-4">Roles & Permissions</h4>

                <Can not I="Administer" a="Permissions">
                    <div className={this.state.checkingAuth ? 'd-none' : 'd-block'}>Sorry, you don't have enough access to view this module.</div>
                </Can>

                <CanWithLoader I="Administer" a="Permissions" isLoading={this.state.checkingAuth}>
                    <div className="row no-gutters animated fadeIn">
                        <div className="card col-xl-6 col-lg-9 col-md-12 col-sm-12">
                            <div className="card-body">
                                <div className="row">
                                  <div className="col-4">
                                    <h6>Roles</h6>
                                    <div className="bp3-input-group mb-2">
                                      <span className="bp3-icon bp3-icon-filter"></span>
                                      <input className="bp3-input" type="text" placeholder="Filter roles" dir="auto" onChange={ this.filterRoles } />
                                    </div>
                                    <div className="list-group flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical"  style={{'overflowX':'scroll', 'maxHeight': '300px'}}>
                                    {
                                        this.state.roles && this.state.roles
                                            .filter((obj) => {
                                                    if (this.state.filterRole) {
                                                        const search = new RegExp(this.state.filterRole.toUpperCase())
                                                        if (search.test(obj.name.toUpperCase())) {
                                                            return obj
                                                        }
                                                    } else { return obj }

                                                })
                                            .map((role, key) => {
                                            return <a key={key} className="list-group-item" id={"v-pills-"+role.id+"-tab"} data-toggle="pill" href={"#v-pills-"+role.id} role="tab" aria-controls="v-pills-home" aria-selected="true">
                                                    <span className={this.state.loading ? 'bp3-skeleton':''}>{role.name}</span>
                                                </a>
                                        })
                                    }
                                    </div>
                                    <Button fill icon="add" className="mt-2" onClick={this.openAddMoreRoleDialog.bind(this)}>Create Role</Button>
                                  </div>
                                  <div className="col-8">
                                    <h6>Permissions</h6>
                                    <div className="bp3-input-group mb-2">
                                      <span className="bp3-icon bp3-icon-filter"></span>
                                      <input className="bp3-input" type="text" placeholder="Filter permissions" dir="auto" onChange={ this.filterPermissions } />
                                    </div>
                                    <div className="tab-content" id="v-pills-tabContent" style={{'overflowX':'scroll', 'maxHeight': '300px'}}>
                                    {
                                        this.state.roles && this.state.roles.map((role, key) => {
                                            return (<div key={key} className="tab-pane fade" id={"v-pills-"+role.id} role="tabpanel" aria-labelledby={"v-pills-"+role.id+"-tab"}>
                                                        <ul className="list-group">
                                                        {
                                                            this.state.permissions &&
                                                                this.state.permissions
                                                                .filter((obj) => {
                                                                    if (this.state.filterPermission) {
                                                                        const search = new RegExp(this.state.filterPermission.toUpperCase())
                                                                        if (search.test(obj.name.toUpperCase())) {
                                                                            return obj
                                                                        }
                                                                    } else { return obj }

                                                                })
                                                                .map((permission, key2) => {
                                                                return (
                                                                        <li key={key2} className="list-group-item">
                                                                            <div className="custom-control custom-checkbox">
                                                                              <input type="checkbox" className="custom-control-input" defaultChecked={(role.permissions.filter(obj => obj.name == permission.name)).length ? true : false} onChange={(e) => {this.handleChange(e, permission.id, role.id)}} id={"permission-"+key+"-"+permission.id} name={"permission-"+key+"-"+permission.id} />
                                                                              <label className="custom-control-label" style={{paddingTop: '3px'}} htmlFor={"permission-"+key+"-"+permission.id}>{permission.name}</label>
                                                                              <button type="button" className="btn btn-link p-0 btn-small float-right"><small><i className="fas fa-trash text-hover-danger text-black-50"></i></small></button>
                                                                            </div>
                                                                        </li>
                                                                    )
                                                            })
                                                        }
                                                        </ul>
                                                    </div>)
                                        })
                                    }
                                    </div>
                                    <Button icon="add" fill className="mt-2" onClick={this.openAddMorePermissionDialog.bind(this)}>Create Permission</Button>
                                  </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CanWithLoader>
            </Admin>
            
        );
    }
}

export default Page;
