'use strict';
var React        = require('react');
var TestUtils    = require('react/lib/ReactTestUtils');
var ExampleGrid = require('../../../examples/scripts/example-full.js');
describe('Grid Integration', () => {
  var component;
  var handleCellDragSpy =  jasmine.createSpy("handleCellDrag");
  var renderGrid = function() {
    component = TestUtils.renderIntoDocument(<ExampleGrid handleCellDrag={handleCellDragSpy}/>);
  }
  describe('Grid Setup', () => {
    beforeEach(() => {
      renderGrid();
    });
    it("Creates the grid", () => {
      expect(component).toBeDefined();
    });

    it("Renders the grid", () => {
      TestUtils.isDOMComponent(component);
    })

    it("Renders 22 rows by default", () => {
      expect(TestUtils.scryRenderedDOMComponentsWithClass(component, 'react-grid-Row').length).toEqual(22);
    })
  });
  describe('Grid Drag', () => {
    beforeEach(() => {
      renderGrid();
    });
    var simulateDrag = function(args) {
      var rows = TestUtils.scryRenderedDOMComponentsWithClass(component,'react-grid-Row');
      var from = TestUtils.scryRenderedDOMComponentsWithClass(rows[args.from],'react-grid-Cell')[args.col];
      var to = TestUtils.scryRenderedDOMComponentsWithClass(rows[args.to],'react-grid-Cell')[args.col];
      var over = [];
      over.push(from)
      for(var i=args.from++;i<args.to;i++) {
        over.push(TestUtils.scryRenderedDOMComponentsWithClass(rows[i],'react-grid-Cell')[args.col])
      }
      over.push(to);
      //Act
      //do the drag
      //Important: we need dragStart / dragEnter / dragEnd
      TestUtils.Simulate.click(from.getDOMNode());
      TestUtils.Simulate.dragStart(from.getDOMNode());
      if(args.beforeEnter) {args.beforeEnter();}

      over.forEach((row) => {
        TestUtils.Simulate.dragEnter(row.getDOMNode())
      });
      if(args.beforeEnd) {args.beforeEnd();}
      TestUtils.Simulate.dragEnd(to.getDOMNode());

      return from;
    }
    it("Drags a column", () => {
      //Arrange
      //get the cell to drag from / to
      var from = simulateDrag({from:0,to:4,col:3})
      //Assert
      //check onCellDrag called with correct data
      expect(handleCellDragSpy).toHaveBeenCalled();
      //Note - fake date is random, so need to test vs the assigned value as it WILL change (and bust the test)
      expect(handleCellDragSpy.argsForCall[0][0]).toEqual({cellKey: "title", fromRow: 0, toRow: 4, value: from.props.value});
    });

    it("Shows drag selector", () => {
      //Arrange
      //get the cell to drag from / to
      var from = simulateDrag({
        from:2,to:5,col:3,
        beforeEnd: function() {
          //check we have the right classes
          expect(TestUtils.scryRenderedDOMComponentsWithClass(component,'is-dragged-over-down').length).toEqual(1);
          expect(TestUtils.scryRenderedDOMComponentsWithClass(component,'was-dragged-over').length).toEqual(2);
        }
      });
    });
  });
});