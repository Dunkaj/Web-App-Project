import React, { Component } from "react"
import { connect } from "react-redux"
import { userMenu, user } from "../../actions"
import UserMenuInner from "./UserMenuInner"

class UserMenu extends Component {
  constructor(props) {
    super(props)
  }

  handleClick = () => {
    if (this.props.isOpen) {
      this.props.userMenuClick()
    }
  }

  componentDidMount() {
    window.addEventListener("click", this.handleClick)
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.handleClick)
  }

  render() {
    let { isOpen, userMenuClick, logOut } = this.props
    return (
      <div
        className="user-menu fas fa-user-circle"
        onClick={e => {
          e.stopPropagation()
          userMenuClick()
        }}
      >
        {isOpen && <UserMenuInner logOut={logOut} />}
      </div>
    )
  }
}

const mapStateToProps = state => state.userMenu

const mapDispatchToProps = {
  userMenuClick: userMenu.userMenuClick,
  logOut: user.loggedOut,
}

const UserMenuConnected = connect(mapStateToProps, mapDispatchToProps)(UserMenu)

export default UserMenuConnected
