
import React, { Component } from 'react'
import _ from 'lodash'
import axios from 'axios'

import {
  Text,
  Label,
  Button,
  Menu,
  NavItem
} from 'rebass'
import { Flex } from 'reflexbox'
import { VelocityTransitionGroup } from 'velocity-react'

import Section from './Section'
import SectionHeading from './SectionHeading'

class Search extends Component {
  constructor () {
    super()
    this.state = {
      address: '',
      loading: false,
      results: [],
      lat: 0,
      lng: 0
    }
    this.onKey = this.onKey.bind(this)
    this.onClick = this.onClick.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.getLegislators = this.getLegislators.bind(this)
  }

  onKey (value, keyCode, e) {
    const val = _.trim(value)
    if (!_.isEqual(val, this.state.address)) {
      this.setState({ address: val })
    }
    // When you press return
    if (_.isEqual(keyCode, 13)) {
      this.onClick()
    }
  }

  fetchData () {
    this.setState({ loading: true, results: [] })
    axios.get(`//maps.googleapis.com/maps/api/geocode/json?&address=${this.state.address}`)
      .then(r => {
        if (!_.isEmpty(r.data.results[0])) {
          const { lat, lng } = r.data.results[0].geometry.location
          this.setState({ lat, lng })
          this.getLegislators()
        }
      })
  }

  getLegislators () {
    const { lat, lng } = this.state
    axios.get(`/legislators/findByLatLng?latitude=${lat}&longitude=${lng}`, {
      baseURL: 'https://crossorigin.me/https://democracy.io/api/1'
    })
      .then(r => {
        this.setState({
          loading: false,
          results: r.data.data
        })
      })
      .catch(r => {
        console.log('error reaching sunlightfoundation')
      })
  }

  onClick (e) {
    if (!_.isEmpty(this.state.address)) {
      this.fetchData()
    }
  }

  render () {
    const { loading, results } = this.state
    return (
      <Section>
        <SectionHeading>
          Find your legislators…
        </SectionHeading>
        <Flex align='flex-end' mb={2}>
          <div className='pr2' style={{ flex: 1 }}>
            <Label
              htmlFor='addressInput'
              style={{ lineHeight: 2 }}
              children='Enter your US address'
            />
            <input
              name='address'
              id='addressInput'
              placeholder='1 Infinite Loop, Cupertino, CA'
              onKeyDown={e => this.onKey(e.target.value, e.keyCode)}
              className='input'
            />
          </div>
          <div className='pt2'>
            <Button
              backgroundColor='green' color='white'
              inverted rounded
              children='Search'
              onClick={e => this.onClick(e)}
            />
          </div>
        </Flex>
        {(loading || results) &&
          <SearchResults
            loading={loading}
            results={results}
          />
        }
      </Section>
    )
  }
}

const SearchResults = ({ loading, results, ...props }) => (
  <VelocityTransitionGroup
    component='section'
    enter={{ animation: 'slideDown', duration: 256 }}
    leave={{ animation: 'slideUp', duration: 256 }}>
    {_.isEqual(loading, true) &&
      <Text color='midgray' children='Loading…' />
    }
    {!_.isEmpty(results) && [
      <Label
        is='p'
        style={{ marginBottom: 4 }}
        children='Jump to a legislator'
        key='label'
      />,
      <Menu is='article' key='menu' style={{ maxWidth: '16rem' }} rounded>
        {_.map(results, r => (
          <SearchResult
            key={r.bioguideId}
            title={r.title}
            firstname={r.firstName}
            lastname={r.lastName}
            state={r.state}
          />
        ))}
      </Menu>
    ]}
  </VelocityTransitionGroup>
)

const SearchResult = ({ title, firstname, lastname, state }) => (
  <NavItem
    is='a'
    href={`#${state}-${lastname}`}
    style={{ fontWeight: 400 }}
    children={`${title} ${firstname} ${lastname}`}
  />
)

export default Search
