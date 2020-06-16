import React from "react"
import { Switch, Route } from "react-router"
import Login from "./Login"
import Users from "./Users"
import Leads from "./Leads"
import Transactions from "./Transactions"
import jsonServerProvider from "ra-data-json-server"
import { Admin, Resource, ListGuesser } from "react-admin"
import englishMessages from "ra-language-english"

const dataProvider = jsonServerProvider("http://jsonplaceholder.typicode.com")
const messages = {
  en: englishMessages,
}
const i18nProvider = locale => messages[locale]

class AppAdmin extends React.Component {
  render() {
    const history = this.props.history
    return (
      // <Switch>
      //   <Route path="/admin/login" component={Login} />
      //   <Route path="/admin/users" component={Users} />
      //   <Route path="/admin/leads" component={Leads} />
      //   <Route path="/admin/transactions" component={Transactions} />
      // </Switch>
      <Admin
        locale="en"
        i18nProvider={i18nProvider}
        dataProvider={dataProvider}
        history={history}
      >
        <Resource name="users" list={ListGuesser} />
      </Admin>
    )
  }
}

export default AppAdmin
