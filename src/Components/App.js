import React, { Component } from 'react'
import AddressForm from './AddressForm.js'
import Timeline from './Timeline'
import $ from 'jquery'

class App extends Component {
  constructor () {
    super()
    this.geocodeIt = this.geocodeIt.bind(this)
    this.compare = this.compare.bind(this)
    this.getBillTotal = this.getBillTotal.bind(this)
    this.closeBillsClicked = this.closeBillsClicked.bind(this)
    this.sponsoredClicked = this.sponsoredClicked.bind(this)
    this.keywordSearch = this.keywordSearch.bind(this)
    this.yearChange = this.yearChange.bind(this)
    this.showKeywordForm = this.showKeywordForm.bind(this)
    this.senatorChange = this.senatorChange.bind(this)
    this.state = {
      senatorInfo: {},
      bills: {},
      currentBills: [],
      year: { billYear: '2017', sessionYear: '2017' },
      offset: '1',
      showLoading: false,
      showForm: true,
      showKeywordSearchForm: false,
      closeVoteClicked: true,
      sponsoredClicked: false,
      yearClicked: false,
      keywordClicked: false,
      showLoadingLine: false
    }
  }

  geocodeIt (fullAddress) {
    this.setState({showLoading: true, showForm: false, showLoadingLine: true})
    $.ajax({
      url: `https://www.googleapis.com/civicinfo/v2/representatives/?key=AIzaSyAiRgU_ysVxPfbMqVQnOEeN4-aLW4OMEw4&roles=legislatorUpperBody&address=${fullAddress}`
    })
    .done(response => {
      const { name } = response.officials[2]
      const district = []
      let key
      for (key in response.divisions) {
        if (response.divisions[key].name.includes('New York State Senate district')) {
          district.push(response.divisions[key].name)
        }
      }
      const districtStr = district.toString()
      const districtNum = districtStr.slice(districtStr.length - 2, districtStr.length)
      const senatorFirstLastSplit = name.split(' ')
      const senatorFirstLast = senatorFirstLastSplit.length > 2 ? senatorFirstLastSplit[0] + ' ' + senatorFirstLastSplit[2] : name
      const repObj = {
        district: districtNum,
        fullName: name,
        firstLast: senatorFirstLast,
        short: senatorFirstLastSplit[2] || senatorFirstLastSplit[1],
        web: response.officials[2].urls[0]
      }
      this.setState({senatorInfo: repObj})
      this.getBillTotal()
    })
  }

  senatorChange (chosenBillYear, chosenSessionYear) {
    if (!this.state.bills[chosenBillYear]) {
      $.fn.fullpage.moveSlideLeft()
      this.setState({showLoading: true, showForm: false})
    }

    const { district } = this.state.senatorInfo
    $.ajax({
      url: `http://legislation.nysenate.gov/api/3/members/search?term=districtCode:${district} AND chamber:'SENATE' AND sessionYear:${chosenSessionYear}&key=042A2V22xkhJDsvE22rtOmKKpznUpl9Y&full=true`,
      method: 'GET'
    })
    .done(response => {
      const senatorName = response.result.items[0].fullName
      const { districtCode } = response.result.items[0]
      const splitName = senatorName.split(' ')
      let formattedName, lastName
      if (splitName.length > 2) {
        formattedName = splitName[0] + '-' + splitName[1][0] + '-' + splitName[2]
        lastName = splitName[2]
      } else {
        formattedName = splitName[0] + '-' + splitName[1]
        lastName = splitName[1]
      }

      if (this.state.senatorInfo.short !== lastName) {
        this.setState({
          senatorInfo: {
            fullName: senatorName,
            district: districtCode,
            web: `https://www.nysenate.gov/senators/${formattedName}`
          }
        })
      }

      if (this.state.bills[this.state.year.billYear]) {
        const cleanCloserVoteBills = this.state.bills[this.state.year.billYear].filter(bill => Math.abs(bill.yay - bill.nay) < 20)
        this.setState({ currentBills: cleanCloserVoteBills })
      } else { this.getBillTotal() }
    })
  }

  yearChange (event) {
    if (this.state.senatorInfo.fullName) {
      const chosenYear = event.target.value
      const chosenBillYear = parseInt(chosenYear)
      const chosenSessionYear = chosenBillYear % 2 === 0 ? chosenBillYear - 1 : chosenBillYear
      this.setState({
        year: {
          billYear: chosenBillYear,
          sessionYear: chosenSessionYear
        },
        closeVoteClicked: false,
        sponsoredClicked: false,
        yearClicked: true,
        keywordClicked: false,
        showLoadingLine: true
      })
      this.senatorChange(chosenBillYear, chosenSessionYear)
    } else {
      return null
    }
  }

  compare (a, b) {
    if (a.date < b.date) {
      return 1
    }
    if (a.date > b.date) {
      return -1
    }
    return 0
  }

  getBillTotal () {
    $.ajax({
      url: `http://legislation.nysenate.gov/api/3/bills/${this.state.year.sessionYear}/search?term=%5C*voteType:'FLOOR'%20AND%20year:${this.state.year.billYear}&key=042A2V22xkhJDsvE22rtOmKKpznUpl9Y&limit=1`,
      method: 'GET'
    })
    .done(response => {
      const billTotal = response.total
      const billPromises = []
      const billYear = parseInt(this.state.year.billYear)
      const sessionYear = parseInt(this.state.year.sessionYear)
      let i
      if (billTotal < 100) {
        billPromises << $.get(`http://legislation.nysenate.gov/api/3/bills/${sessionYear}/search?term=%5C*voteType:'FLOOR'%20AND%20year:${billYear}&key=042A2V22xkhJDsvE22rtOmKKpznUpl9Y&limit=${billTotal + 1}&full=true`)
      } else {
        for (i = 1; i < Math.ceil(billTotal / 100); i += 1) {
          let offset = i * 100
          if (i === 1) {
            billPromises.push($.get(`http://legislation.nysenate.gov/api/3/bills/${sessionYear}/search?term=%5C*voteType:'FLOOR'%20AND%20year:${billYear}&key=042A2V22xkhJDsvE22rtOmKKpznUpl9Y&offset=${i}&limit=100&full=true`))
          } else {
            billPromises.push($.get(`http://legislation.nysenate.gov/api/3/bills/${sessionYear}/search?term=%5C*voteType:'FLOOR'%20AND%20year:${billYear}&key=042A2V22xkhJDsvE22rtOmKKpznUpl9Y&offset=${offset}&limit=100&full=true`))
          }
        }
      }
      let allCleanBills = []
      Promise.all(billPromises).then(billGlobs => {
        billGlobs.forEach(billGlob => {
          const allBills = billGlob.result.items

          const nays = allBills.map(bill => bill.result.votes.items[bill.result.votes.items.length - 1].memberVotes.items.NAY)
          const naysArray = nays.map(votes => votes ? votes : { size: 0 })

          const yays = allBills.map(bill => bill.result.votes.items[bill.result.votes.items.length - 1].memberVotes.items.AYE)
          const yaysArray = yays.map(votes => votes ? votes : { size: 0 })

          const senatorVotes = allBills.map(bill => {
            if (bill.result.votes.items[bill.result.votes.items.length - 1].memberVotes.items.AYE &&
              bill.result.votes.items[bill.result.votes.items.length - 1].memberVotes.items.AYE.items
              .some(senator => senator.fullName === this.state.senatorInfo.fullName ||
                senator.fullName === this.state.senatorInfo.firstLast ||
                senator.fullName.split(' ')[senator.fullName.split(' ').length - 1] === this.state.senatorInfo.short)) {
              return 'yay'
            } else if (bill.result.votes.items[bill.result.votes.items.length - 1].memberVotes.items.NAY &&
              bill.result.votes.items[bill.result.votes.items.length - 1].memberVotes.items.NAY.items
              .some(senator => senator.fullName === this.state.senatorInfo.fullName ||
                senator.fullName === this.state.senatorInfo.firstLast ||
                senator.fullName.split(' ')[senator.fullName.split(' ').length - 1] === this.state.senatorInfo.short)) {
              return 'nay'
            } else {
              return 'n/a'
            }
          })

          const billSponsors = allBills.map(bill => bill.result.sponsor.member !== null ? bill.result.sponsor.member.fullName : 'n/a')

          const cleanBills = allBills.map((bill, i) => {
            return {
              title: bill.result.title,
              year: bill.result.year,
              yay: yaysArray[i].size,
              nay: naysArray[i].size,
              senatorDecision: senatorVotes[i],
              summary: bill.result.summary.slice(0, (bill.result.title.length * 2)) + '...',
              status: bill.result.status.statusDesc,
              date: bill.result.status.actionDate,
              sponsor: billSponsors[i],
              session: bill.result.session,
              billId: bill.result.printNo
            }
          })
          allCleanBills = [...allCleanBills, ...cleanBills]
        })

        allCleanBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        const closeVoteBills = allCleanBills.filter(bill => (Math.abs(bill.yay - bill.nay) < 20) && (bill.yay + bill.nay > 30))

        this.setState({
          showLoading: false,
          showForm: true,
          showLoadingLine: false
        })
        this.setState({
          currentBills: closeVoteBills
        })
        const billsStateVar = this.state.bills
        billsStateVar[this.state.year.billYear] = allCleanBills
        $.fn.fullpage.moveSlideRight()
        this.setState({
          bills: billsStateVar
        })
      })
    })
  }

  componentDidMount () {
    $('#fullpage').fullpage({scrollOverflow: true, autoScrolling: false, fitToSection: false})
  }

  closeBillsClicked () {
    if (this.state.senatorInfo.fullName) {
      const closeVoteBills = this.state.bills[this.state.year.billYear].filter(bill => (Math.abs(bill.yay - bill.nay) < 20) && (bill.yay + bill.nay > 30))

      this.setState({
        currentBills: closeVoteBills,
        closeVoteClicked: true,
        yearClicked: false,
        sponsoredClicked: false,
        keywordClicked: false
      })
    } else {
      return null
    }
  }

  sponsoredClicked () {
    if (this.state.senatorInfo.fullName) {
      const senatorSponsoredBills = this.state.bills[this.state.year.billYear].filter(bill => bill.sponsor === this.state.senatorInfo.firstLast ||
       bill.sponsor === this.state.senatorInfo.fullName ||
       bill.sponsor.includes(this.state.senatorInfo.short))

      this.setState({
        currentBills: senatorSponsoredBills,
        sponsoredClicked: true,
        closeVoteClicked: false,
        yearClicked: false,
        keywordClicked: false
      })
    } else {
      return null
    }
  }

  keywordSearch (event) {
    event.preventDefault()
    const searchTerm = this.refs.keywordBox.value
    const keywordSearchBills = this.state.bills[this.state.year.billYear].filter(bill => bill.summary.includes(searchTerm))
    this.setState({
      currentBills: keywordSearchBills,
      showKeywordSearchForm: false
    })
  }

  showKeywordForm () {
    if (this.state.senatorInfo.fullName) {
      this.setState({
        showKeywordSearchForm: true,
        keywordClicked: true,
        closeVoteClicked: false,
        sponsoredClicked: false,
        yearClicked: false
      })
    } else { return null }
  }

  render () {
    const closeVoteClickedClass = this.state.closeVoteClicked ? ' clickedOn' : ''
    const sponsoredClickedClass = this.state.sponsoredClicked ? ' clickedOn' : ''
    const yearClickedClass = this.state.yearClicked ? ' clickedOn' : ''
    const keywordClickedClass = this.state.keywordClicked ? ' clickedOn' : ''
    const loadingText = this.state.showLoadingLine ? 'Fetching bill info...' : ''
    let timelineFilters
    if (this.state.showKeywordSearchForm) {
      timelineFilters = <div className='row' id='keywordDiv'><form className='keyword-search' id='keyword-search-form' type='button' onSubmit={this.keywordSearch}><div className='keyword-search-box input-field col s9'><label htmlFor='keywordBox'>Search for bills by keyword</label><input ref='keywordBox' name='keywordBox' id='keywordBox' type='text' /></div><div className='col s3 waves-effect waves-light btn' id='supaDupaButton'><input type='submit' value='search' /></div></form></div>
    } else {
      timelineFilters =
        <ul className='row'>
          <li className='col s3'>
            <a id='closeVoteButton' className={'waves-effect waves-light btn' + closeVoteClickedClass} onClick={this.closeBillsClicked}>close vote bills</a>
          </li>

          <li className='col s3'>
            <a className={'waves-effect waves-light btn' + sponsoredClickedClass} onClick={this.sponsoredClicked}>Sponsored bills</a>
          </li>

          <li className='col s3'>
            <a className={'waves-effect waves-light btn' + keywordClickedClass} onClick={this.showKeywordForm}>Keyword Search</a>
          </li>

          <li id='year-search' className='input-field col s3'>
            <select className={yearClickedClass} onChange={this.yearChange} value={this.state.year.billYear}>
              <option value='Choose your option' disabled />
              <option value='2009'>2009</option>
              <option value='2010'>2010</option>
              <option value='2011'>2011</option>
              <option value='2012'>2012</option>
              <option value='2013'>2013</option>
              <option value='2014'>2014</option>
              <option value='2015'>2015</option>
              <option value='2016'>2016</option>
              <option value='2017'>2017</option>
            </select>
          </li>
        </ul>
    }

    return (
      <div ref='test' id='fullpage'>
        <div className='section'>
          <div id='landingPageBG' className='slide'>
            <AddressForm hideIt={this.state.showForm} getAddress={this.geocodeIt} /> :
            <h2 id='loading-line'>{loadingText}</h2>
            <h1 id='main-font'>STATE MATTERS</h1>
          </div>
          <div id='page2BG' className='slide'>

            <Timeline bills={this.state.currentBills} year={this.state.year} senatorInfo={this.state.senatorInfo} timelineFilters={timelineFilters} closeVoteClicked={this.state.closeVoteClicked} />

          </div>
          <div className='fp-controlArrow fp-next' />
          <div className='fp-controlArrow fp-next' />
        </div>
      </div>
    )
  }
}

export default App
