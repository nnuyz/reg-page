!function(name, definition) {
    if (typeof define === 'function') define(name, definition);
    else if (typeof module !== 'undefined' && module.exports) module.exports = definition();
    else this[name] = definition();
}('Select', function() {
    'use strict';
    class Component {
        constructor(props){
            this.props = props || {
            };
            this.state = {
            };
            this.refs = {
            };
            this.$disposables = {
                mounted: [],
                updated: []
            };
        }
        $defer(stage, dispose1) {
            this.$disposables[stage].push(dispose1);
        }
        $dispose(stage1) {
            this.$disposables[stage1].reverse().forEach((dispose)=>dispose()
            );
            this.$disposables[stage1].length = 0;
        }
        componentMount(ctx) {
            this.$el && this.componentUnmount();
            this.componentWillMount();
            this.$el = ctx && ctx.el || document.createElement('div');
            this.$defer('mounted', ()=>{
                this.$el.innerHTML = '';
                this.$el = null;
            });
            this.forceUpdate();
            this.componentDidMount();
            return this;
        }
        componentWillMount() {
        }
        componentDidMount() {
        }
        componentUnmount() {
            this.componentWillUnmount();
            this.$dispose('mounted');
            this.componentDidUnmount();
            return this;
        }
        componentWillUnmount() {
        }
        componentDidUnmount() {
        }
        setState(updater, callback) {
            let prevState = this.state;
            let nextState = typeof updater == 'function' ? updater(prevState, this.props) : updater;
            this.state = Object.assign(prevState, nextState);
            if (this.shouldComponentUpdate(prevState, nextState)) this.forceUpdate();
            callback && callback.call(this);
            return this;
        }
        forceUpdate() {
            this.componentUpdate(this.props, this.state);
            return this;
        }
        shouldComponentUpdate(prevState1, nextState) {
            return prevState1 !== nextState;
        }
        componentUpdate(props1, state) {
            if (this.$el) {
                this.componentWillUpdate(props1, state);
                this.$dispose('updated');
                this.$el.innerHTML = this.render(props1, state);
                this.refs = Array.from(this.$el.querySelectorAll('[ref]')).reduce(function(refs, node) {
                    return refs[node.getAttribute('ref')] = node, refs;
                }, {
                });
                this.componentDidUpdate(props1, state);
            }
        }
        componentWillUpdate(props2, state1) {
        }
        render(props3, state2) {
            return '';
        }
        componentDidUpdate(props4, state3) {
        }
    }
    class Select extends Component {
        constructor(props5){
            super(props5);
            this.state = {
                placeholder: this.props.placeholder || '',
                expanded: false
            };
            this.onDocumentClick = this.onDocumentClick.bind(this);
            this.onComponentClick = this.onComponentClick.bind(this);
            this.onToolboxClick = this.onToolboxClick.bind(this);
            this.search = new Search(Object.assign({
            }, this.props, {
                onSelected: (selected)=>{
                    this.props.onSelected && this.props.onSelected(selected);
                    this.setState((prevState)=>({
                            placeholder: selected.text || selected.value,
                            selected: selected,
                            expanded: false
                        })
                    );
                }
            }));
        }
        onDocumentClick(event) {
            this.setState((prevState)=>({
                    expanded: false
                })
            );
        }
        onComponentClick(event1) {
            event1.stopPropagation();
        }
        onToolboxClick(event2) {
            this.setState((prevState)=>({
                    expanded: !prevState.expanded
                })
            , ()=>{
                if (this.state.expanded) this.search.refs.query.focus();
            });
        }
        render(props6, state4) {
            return `<div class="select__box">
                  <div ref="toolbox" class="select__toolbox">
                      <i class="select__arrow" aria-hidden="true"></i>
                      <div class="select__label">${state4.placeholder}</div>
                  </div>
                  <div ref="dropdown" class="select__dropdown ${state4.expanded ? "select__dropdown--show" : ""}"></div>
              </div>`;
        }
        componentDidMount() {
            document.body.addEventListener('click', this.onDocumentClick);
            this.$defer('mounted', ()=>document.body.removeEventListener('click', this.onDocumentClick)
            );
            this.$el.addEventListener('click', this.onComponentClick);
            this.$defer('mounted', ()=>this.$el.removeEventListener('click', this.onComponentClick)
            );
        }
        componentDidUnmount() {
            this.search.componentUnmount();
        }
        componentDidUpdate() {
            const $toolbox = this.refs.toolbox;
            $toolbox.addEventListener('click', this.onToolboxClick);
            this.$defer('updated', ()=>$toolbox.removeEventListener('click', this.onToolboxClick)
            );
            this.search.componentMount({
                el: this.refs.dropdown
            });
        }
    }
    class Search extends Component {
        constructor(props7){
            super(props7);
            this.state = {
                query: "",
                dataset: this.props.dataset || [],
                selected: this.props.selected
            };
            this.onQueryChanged = this.onQueryChanged.bind(this);
            this.onItemClicked = this.onItemClicked.bind(this);
        }
        onQueryChanged(event3) {
            const query = event3.target.value;
            const match = new RegExp(query, 'gi');
            const dataset = (this.props.dataset || []).filter((item)=>match.test(item.text || item.value || '')
            );
            this.setState((prevState)=>({
                    query: query,
                    dataset: dataset
                })
            );
        }
        onItemClicked(event4) {
            const index = event4.target.closest('li').dataset.index;
            const selected = this.state.dataset[index];
            this.props.onSelected && this.props.onSelected(selected);
            this.setState((prevState)=>({
                    selected: selected
                })
            );
        }
        render(props8, state5) {
            if (state5.dataset.length === 0) return `<input ref="query" type="text" value="${state5.query}" class="select__query">
                  <span class="select__query_noresult">No results found</span>`;
            return `<input ref="query" type="text" value="${state5.query}" class="select__query">
                  <ul ref="list" class="select__list">
                      ${state5.dataset.map(function(item, index) {
                return `
                                  <li class="select__item ${item === state5.selected ? "select__item--selected" : ""}" data-index="${index}" data-value="${item.value || item.text}">
                                      <i class="select__item_icon fa ${item.icon || ''}" aria-hidden="true"></i>
                                      <span class="select__item_text">${item.text || item.value}</span>
                                  </li>`;
            }).join('')}
                  </ul>`;
        }
        componentDidUpdate() {
            const $query = this.refs.query;
            $query.addEventListener('change', this.onQueryChanged);
            this.$defer('updated', ()=>$query.removeEventListener('change', this.onQueryChanged)
            );
            const $list = this.refs.list;
            $list.addEventListener('click', this.onItemClicked);
            this.$defer('updated', ()=>$list.removeEventListener('click', this.onItemClicked)
            );
        }
    }
    return Select;
});
const source = [
    {
        icon: 'fa-font',
        value: 'Abril Fatface'
    },
    {
        icon: 'fa-font',
        value: 'Allura'
    },
    {
        icon: 'fa-font',
        value: 'Amatic SC'
    }
];
let select = Array.from(document.querySelectorAll('[ref="select"]')).map((el)=>{
    return new Select({
        placeholder: 'Select Font',
        dataset: source,
        onSelected: (item)=>console.log(item)
    }).componentMount({
        el: el
    });
});

//# sourceMappingURL=index.43221a52.js.map
