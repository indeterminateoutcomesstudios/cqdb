import React, { Component, } from 'react';
import ReactList from 'react-list';
import {
  Checkbox,
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Grid,
  ListGroup,
  ListGroupItem,
  Media,
  Panel,
  Row,
} from 'react-bootstrap';
import { LinkContainer, } from 'react-router-bootstrap';

import { filterByText, filterByCheckbox, } from '../util/filters';
import { imagePath, } from '../util/imagePath';
import { range, } from '../util/range';
import { resolve, } from '../util/resolve';
import { parseURL, updateURL, } from '../util/url';
const sbwData = require('../Decrypted/filtered_weapon_sbw.json');

const filterCategories = ['Star', 'Category',];

const data = sbwData.reverse().map(i => {
  const dict = {
    'Sword': 'Warrior',
    'Hammer': 'Paladin',
    'Bow': 'Archer',
    'Gun': 'Hunter',
    'Staff': 'Wizard',
    'Orb': 'Priest',
  };

  let heroName = i.grade === 5 ? i.reqhero[1] : i.reqhero_ref;
  if (heroName.includes('LIMITED_RB') || heroName.includes('KOF')) {
    heroName = heroName.replace(/_\d/, '');
  } else if (heroName.includes('DEEMO')) {
    heroName = heroName.replace(/_\d/, '') + heroName.match(/_\d/)[0];
  }
  heroName = resolve(`TEXT_${heroName}_NAME`);

  // make weapon's filterable object
  const f = [
    i.grade.toString(),
    resolve(`TEXT_WEAPON_CATE_${i.categoryid.substring(4)}`),
  ];

  const filterable = {};
  filterCategories.forEach((i, index) => filterable[i] = f[index]);

  return {
    image: i.skin_tex,
    filterable: filterable,
    name: resolve(i.name),
    description: resolve(i.desc),
    range: i.range,
    atkPower: i.attdmg,
    atkSpeed: i.attspd,
    heroName: heroName,
    class: dict[filterable['Category']],
  };
});

// initialize checkboxes
const checkboxes = {
  Star: range(6),
  Category: ['Sword', 'Hammer', 'Bow', 'Gun', 'Staff', 'Orb',],
};

//console.log(data, checkboxes);

export default class Soulbound extends Component {
  state = {
    textFilter: '',
    checkboxFilters: {},
    render: [],
  }

  componentWillMount = () => {
    this.timer = null;
    const [textFilter, checkboxFilters] = parseURL(checkboxes);
    const processed = filterByCheckbox(filterByText(data, textFilter), checkboxFilters);
    const render = processed.map(this.renderListGroupItem);

    this.setState({textFilter, checkboxFilters, render,});
  }

  componentWillReceiveProps = () => {
    this.componentWillMount();
  }

  renderListGroupItem = (weapon) => {
    return (
      <LinkContainer
        key={`${weapon.image}${weapon.filterable.Star}`}
        to={`/cqdb/heroes/${weapon.heroName}&${weapon.filterable.Star}&${weapon.class}`}
      >
        <ListGroupItem>
          <Media>
            <Grid fluid>
              <Row>
                <Col style={{padding: 0,}} lg={2} md={3} sm={4} xs={5}>
                  <Media.Left style={{display: 'flex', justifyContent: 'center',}}>
                    <img alt='' src={imagePath('cq-assets', `sbws/${weapon.image}.png`)} />
                  </Media.Left>
                </Col>
                <Col style={{padding: 0,}} lg={10} md={9} sm={8} xs={7}>
                  <Media.Body>
                    <Media.Heading>{`${weapon.name} (${weapon.filterable.Star}★) / ${weapon.heroName}`}</Media.Heading>
                    <p>{`${weapon.filterable.Category} | Range: ${weapon.range} | Atk. Power: ${weapon.atkPower} | Atk. Speed: ${weapon.atkSpeed}`}</p>
                    <p>{weapon.description}</p>
                  </Media.Body>
                </Col>
              </Row>
            </Grid>
          </Media>
        </ListGroupItem>
      </LinkContainer>
    );
  }
  changeView = () => {
    updateURL(
      this.state.textFilter,
      this.state.checkboxFilters,
    );
    const processed = filterByCheckbox(filterByText(data, this.state.textFilter), this.state.checkboxFilters)

    this.setState({ render: processed.map(this.renderListGroupItem), });
  }

  handleTextChange = (e) => {
    if (e.target.value.includes('\n')) { return; }

    clearTimeout(this.timer);
    this.setState({ textFilter: e.target.value, }, () => {
      this.timer = setTimeout(() => this.changeView(), 500);
    });
  }

  handleCheckbox = (e) => {
    const [key, value] = e.target.name.split('&');
    const checkboxFilters = this.state.checkboxFilters;
    checkboxFilters[key][value] = e.target.checked;

    this.setState({ checkboxFilters: checkboxFilters,}, () => this.changeView());
  }

  renderCheckbox = (category, label) => {
    const isChecked = this.state.checkboxFilters[category][label];
    return (
      <Checkbox defaultChecked={isChecked} inline key={`${label}${isChecked}`} name={`${category}&${label}`} onChange={this.handleCheckbox}>
        {label}
      </Checkbox>
    );
  }

  renderCheckboxes = () => {
    return (
      Object.keys(checkboxes).map(i => (
        <FormGroup key={i}>
          <Col componentClass={ControlLabel} lg={2} md={3} sm={4} xs={12}>{i}</Col>
          <Col lg={10} md={9} sm={8} xs={12}>{checkboxes[i].map(j => this.renderCheckbox(i, j))}</Col>
        </FormGroup>
      ))
    );
  }

  render = () => {
    return (
      <Row>
        <Col lg={12} md={12} sm={12} xs={12}>
          <Panel collapsible defaultExpanded header='Filters'>
            <Form horizontal>
              <FormGroup>
                <Col componentClass={ControlLabel} lg={2} md={3} sm={4} xs={12}>Name</Col>
                <Col lg={10} md={9} sm={8} xs={12}>
                  <FormControl
                    componentClass='textarea'
                    onChange={this.handleTextChange}
                    style={{height: '34px', resize: 'none',}}
                    value={this.state.textFilter}
                  />
                </Col>
              </FormGroup>
              {this.renderCheckboxes()}
            </Form>
          </Panel>
          <Panel collapsible defaultExpanded header={`Soulbound Weapons (${this.state.render.length})`}>
            <ListGroup fill>
              <ReactList
                itemRenderer={i => this.state.render[i]}
                length={this.state.render.length}
                minSize={10}
              />
            </ListGroup>
          </Panel>
        </Col>
      </Row>
    );
  }
}
