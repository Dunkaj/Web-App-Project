import React from "react"
import { connect } from "react-redux"
import Table from "Components/Table"
import { leads } from "../../actions"

class My extends React.Component {
  constructor(props) {
    super(props)

    leads.getLeads(props.dispatch)
  }
  moveLeadsToSell = () => {
    console.log(Array.from(this.props.leads.selected))
  }
  moveLeadToSell = id => {
    console.log([id])
  }
  onScrollBottom = cb => {
    let { dispatch, leads } = this.props

    getLeads(dispatch, cb, leads.page + 1)
  }
  buildButtonLabel = amount => {
    if (amount > 1) {
      return "move " + amount + " leads to sell"
    } else if (amount === 1) {
      return "move lead to sell"
    } else {
      return "move leads to sell"
    }
  }
  getButtons = amountSelected => {
    return {
      table: [
        {
          value: this.buildButtonLabel(amountSelected),
          onClick: this.moveLeadsToSell,
          actionPerSelected: true,
        },
      ],
      record: [
        {
          value: "move to sell",
          onClick: this.moveLeadToSell,
        },
      ],
    }
  }
  setSelectedRecords = selectedLeads => {
    this.props.dispatch(leads.setSelectedLeads(selectedLeads))
  }
  render() {
    return (
      <>
        <h1>My Leads</h1>
        <Table
          fields={this.props.fields}
          records={this.props.leads.list}
          buttons={this.getButtons(this.props.leads.selected.size)}
          setSelectedRecords={this.setSelectedRecords}
          onScrollBottom={this.onScrollBottom}
          selected={this.props.leads.selected}
          isSelectable={true}
        />
      </>
    )
  }
}

const mapStateToProps = state => ({
  leads: state.myLeads,
  fields: state.fields,
})

export default connect(mapStateToProps)(My)
