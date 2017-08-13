/* global App */
'use strict';
var elements = [];
var lookupBlock = {'partner_network':'pn', 'key_activities':'ka', 'key_resources':'kr',
    'cost_structure':'c', 'value_proposition':'vp','customer_segments':'cs',
    'customer_relationship':'cr','channels':'dc','revenue_streams':'r'
    };

var lookupColor = ['yellow', 'green', 'blue', 'purple', 'red', 'orange'];
App.appView.currentView.currentView.model.postIts().models.sort(function(a, b){return a.attributes.top - b.attributes.top;}).forEach(function(p){
  /*jshint camelcase: false */
  //order by z-index?
  var e = {};
  e.id = p.attributes.guid;
  e.name = p.attributes.name;
  e.colors = [p.attributes.colour_class];
  e.type = lookupBlock[p.attributes.block];
//type.ValueMap "CustomerProfile"
  e.vpCanvas.attributes.post_its.models*.attributes
    .block = 'gain_creators' "products_and_services" "pain_relievers" "gains" "jobs" "pains"
    .guid
    .type: 'value-prop' | 'business-model'
    same props as other post-it


// potential attributes, notes, market_size, comments (array), hypotheses (array)
/*
vpCanvasPostIts()

comments.models*attributes.body|user_id|updated_at
hypotheses*statement|test_summary_status(In progress)|state|id

comments() to get canvas comment
notes() = canvas note

blockNames() key {human: =name}

calculations()
cost_type|unit_cost|cost_structure-ref
calculations.models*.attributes.fields, customer_segement, cost
revenue
revenue_streamstime_period
stream_type

App.user.attributes

*/
  // TODO: relative to canvas
  e.left =  p.attributes.left * (p.attributes.block === 'revenue_streams'|| p.attributes.block === 'cost_structure' ? 640 : 256);
  e.top =  p.attributes.top * (p.attributes.block === 'revenue_streams'||
    p.attributes.block === 'cost_structure' ? 225 : ( p.attributes.block === 'partner_network' ||
    p.attributes.block === 'value_proposition' || p.attributes.block === 'customer_segments' ? 675 : 337));
  // TODO:
  // notes
  elements.push(e);
});

var text = document.createElement('textarea');
text.value = JSON.stringify(elements);
text.style.top = 0;
text.style.left = 0;
text.style.width = '100%';
text.style.height = '50%';
text.style.position = 'absolute';
text.style.zIndex  = 9999;
text.ondblclick = function(){ this.parentNode.removeChild(this); };
document.getElementsByTagName('body')[0].appendChild(text);