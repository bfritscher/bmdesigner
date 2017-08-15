/* global App */
function exportCanvas() {
  const overlay = document.createElement('div');
  document.body.appendChild(overlay);
  overlay.outerHTML = '<div style="position: fixed;top: 0;bottom: 0;left: 0;right: 0;display: none;border: 0;z-index: 10000;background: rgba(27,32,37,0.95);overflow-y: auto;overflow-x: hidden;"></div>';

  const model = App.appView.currentView.currentView.model;
  const notes = [];
  const project = {
    info: {
      name: model.attributes.name,
      description: model.attributes.note,
    },
    source: 'strategyzer',
    notes,
  };

  const lookupBlock = {
    partner_network: 'pn',
    key_activities: 'ka',
    key_resources: 'kr',
    cost_structure: 'c',
    value_proposition: 'vp',
    customer_segments: 'cs',
    customer_relationship: 'cr',
    channels: 'dc',
    revenue_streams: 'r',
    products_and_services: 'features',
    gain_creators: 'solution',
    pain_relievers: 'solution',
    jobs: 'job',
    gains: 'pain_gain',
    pains: 'pain_gain',
  };

  const lookupColor = ['yellow', 'green', 'blue', 'purple', 'red', 'orange'];

  App.appView.currentView.currentView.model.postIts().models
    .sort((a, b) => a.attributes.z_index - b.attributes.z_index).forEach((p) => {
      let left = p.attributes.left * 20;
      let top = p.attributes.top * (p.attributes.block === 'partner_network' ||
        p.attributes.block === 'value_proposition' || p.attributes.block === 'customer_segments' ? 75 : 37.5);

      if (p.attributes.block === 'key_resources' || p.attributes.block === 'channels') {
        top += 37.5;
      }
      if (p.attributes.block === 'revenue_streams' || p.attributes.block === 'cost_structure') {
        left = p.attributes.left * 50;
        top = (p.attributes.top * 25) + 75;
      }
      if (p.attributes.block === 'revenue_streams') {
        left += 50;
      }
      if (p.attributes.block === 'key_resources' || p.attributes.block === 'key_activities') {
        left += 20;
      }

      if (p.attributes.block === 'value_proposition') {
        left += 40;
      }

      if (p.attributes.block === 'customer_relationship' || p.attributes.block === 'channels') {
        left += 60;
      }

      if (p.attributes.block === 'customer_segments') {
        left += 80;
      }

      const e = {
        id: p.attributes.guid,
        text: p.attributes.name,
        colors: [lookupColor.indexOf(p.attributes.colour_class)],
        type: lookupBlock[p.attributes.block],
        description: p.attributes.note,
        left: left - 2,
        top,
      };

      notes.push(e);
      if (p.attributes.vpCanvas) {
        p.attributes.vpCanvas.attributes.post_its.models
        .sort((a, b) => a.attributes.z_index - b.attributes.z_index)
        .forEach((vpcP) => {
          let vpcLeft = vpcP.attributes.left * 40;
          if (['jobs', 'gains', 'pains'].indexOf(vpcP.attributes.block) > -1) {
            vpcLeft += 60;
          }

          const e2 = {
            id: vpcP.attributes.guid,
            text: vpcP.attributes.name,
            colors: [lookupColor.indexOf(vpcP.attributes.colour_class)],
            type: lookupBlock[vpcP.attributes.block],
            description: vpcP.attributes.note,
            left: vpcLeft - 2,
            top: vpcP.attributes.top * 100,
            parent: p.attributes.guid,
          };
          notes.push(e2);
        });
      }
    });

  fetch(' https://us-central1-bmdesigner-50d6c.cloudfunctions.net/importJSONProject', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(project),
  })
    .then(res => res.text()).then((url) => {
      window.open(url, '_blank');
    });
}

let button = document.getElementById('bmdesigner_export');
if (!button) {
  button = document.createElement('div');
  button.id = 'bmdesigner_export';
  const menu = document.getElementsByClassName('canvas-menu-bar');
  if (menu && menu.length > 0) {
    menu[0].appendChild(button);
    button.innerHTML = '<div style="box-shadow: rgb(245, 151, 142) 0px 1px 0px 0px inset; background: linear-gradient(rgb(242, 69, 55) 5%, rgb(198, 45, 31) 100%) rgb(242, 69, 55); border-radius: 6px; border: 1px solid rgb(208, 39, 24); cursor: pointer; color: rgb(255, 255, 255); font-family: Arial; font-size: 15px; font-weight: bold; padding: 6px 24px; text-decoration: none; text-shadow: rgb(129, 14, 5) 0px 1px 0px;margin: 16px; text-align: center">EXPORT<br/>TO<br/>BM|Designer</div>';
    button.addEventListener('click', exportCanvas);
  }
}

      // type.ValueMap "CustomerProfile"
      /*
        e.vpCanvas.attributes.post_its.models*.attributes
          .block = 'gain_creators' "products_and_services" "pain_relievers" "gains" "jobs" "pains"
          .guid
          .type: 'value-prop' | 'business-model'
          same props as other post-it
      */

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
