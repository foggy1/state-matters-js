import React from 'react'
import { Pie } from 'react-chartjs-2'

class Bill extends React.Component {
  constructor () {
    super()
    this.renderChart = this.renderChart.bind(this)
  }

  renderChart () {
    const { yay, nay } = this.props.data
    const data = {
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
    const {
      session,
      title,
      senatorDecision,
      status,
      date,
      billId
    } = this.props.data

    let {othaSupaKey} = this.props

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
