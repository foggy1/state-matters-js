import React from 'react'

const RepInfoDisplay = ({repDisplay}) => {
  const { fullName, district, web } = repDisplay
  const webInfo = fullName ? fullName + "'s Website" : null
  return (
    <div className='materialize' id='rep-info'>
      <ul id='repInfoUL' className='collection row'>

        <li className='collection-item avatar col s4'>

          <span className='title'>Your State Senator</span>
          <p>{fullName}</p>
        </li>

        <li className='collection-item avatar col s4'>

          <span className='title'>District</span>
          <p>{district}</p>
        </li>

        <li className='collection-item avatar col s4'>

          <p id='senatorLink'><a target='_blank' href={web}>{webInfo}</a></p>
        </li>

      </ul>
    </div>
  )
}

export default RepInfoDisplay
