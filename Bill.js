import React from 'react'
import { Pie } from 'react-chartjs-2'

class Bill extends React.Component {
  constructor () {
    super()
    this.renderChart = this.renderChart.bind(this)
  }

  renderChart () {
    const { yay, nay } = this.props.data
    var data = {
      labels: [
        'Yay',
        'Nay'
      ],
      datasets: [
        {
          data: [yay, nay],
          backgroundColor: [
            '#D3D3D3',
            '#2a2a2a'
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB'
          ]
        }
      ]
    }
    return <Pie data={data} redraw={true} />
  }

  render () {
    let {year, session, title, yay, nay, senatorDecision, summary, status, date, billId} = this.props.data

    let {supaKey, othaSupaKey} = this.props
    let othaOthaSupaKey = this.props.othaSupaKey + 1000
    let realKey = othaOthaSupaKey + 1000

            // <p id={othaOthaSupaKey} ref='holder'><canvas ref='chart' id={realKey} /></p>
    return (
      <li id={othaSupaKey}>
        <div className='big-box'>
          <p id='title'>"{title}"</p>
          <hr />
          <p id='decision'><span id='billInfo'>YOUR SENATOR'S DECISION</span>: {senatorDecision}</p>
          <p><span id='billInfo'>STATUS</span>: {status} as of {date}</p>
          <div className='hover-box'>
            <br />
            {this.renderChart()}
            <br />
            <p><a target='_blank' href={'https://www.nysenate.gov/legislation/bills/' + session + '/' + billId}>bill webpage</a> | <a target='_blank' href={'http://legislation.nysenate.gov/api/3/bills/' + session + '/' + billId + '.pdf/?key=042A2V22xkhJDsvE22rtOmKKpznUpl9Y'}>bill pdf</a></p>
          </div>
        </div>
      </li>
    )
  }
}

export default Bill
