import React from 'react'
import Bill from './Bill.js'
import $ from 'jquery'
import fullpage from 'fullpage.js'
import { setupListeners } from '../utils/timeline_fcns'
import RepInfoDisplay from './RepInfoDisplay'

class Timeline extends React.Component {
  componentDidUpdate () {
    setupListeners()
    $.fn.fullpage.reBuild()
  }

  render () {
    const {bills, year} = this.props

    return (
      <div id='timelineboi'>

        <section className='intro'>
          <div className='container'>
            <RepInfoDisplay repDisplay={this.props.senatorInfo} />

            <h1 id='timeline-title'>{year.billYear} BILLS </h1>

            <div className='materialize' id='timeline-filterables'>
              {this.props.timelineFilters}
            </div>
          </div>
        </section>

        <section className='filter-tabs'>
          <div className='all-bills' />
        </section>

        <section className='timeline'>
          <ul id='timeline-ul'>
            {bills.map((bill, idx) => <Bill data={bill} key={idx} supaKey={idx} othaSupaKey={idx + 1000} />)}
          </ul>
        </section>
      </div>
    )
  }
}

export default Timeline