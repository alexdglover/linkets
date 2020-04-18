var debug = false;

var origin = '';

$(function() {
  var client = ZAFClient.init();
  client.invoke('resize', { width: '100%', height: '400px' });
  client.context().then(
    function(data){
      origin = 'https://' + data['account']['subdomain'] + '.zendesk.com';
      if (debug) {
        console.log(data);
        console.log(origin);
      }
    }
  )
  processLinkedTickets();

  $('.get_help').on('click', showDeflectionModal);
  function showDeflectionModal(){
    client.invoke('instances.create', {
      location: 'modal',
      url: 'assets/deflection-modal.html'
    }).then(function(modalContext) {
      // The modal is on the screen, now resize it
      var modalClient = client.instance(modalContext['instances.create'][0].instanceGuid);
      modalClient.invoke('resize', { width: '40vw', height: '100%' });
    });
  }

});

function processLinkedTickets() {
  // Clear any populated divs first
  $("#candidate-tickets").html('')
  $("#content").html('')

  var client = ZAFClient.init();
  client.get('ticket.tags').then(
    function(data) {
      var tags = data['ticket.tags'];
      var linkedTickets = parseLinkedTickets(tags);
      if (linkedTickets.length == 0) {
        showNoLinkedTickets();
      }
      else {
        getLinkedTicketDetail(client, linkedTickets);
      }
    }
  );
}

function parseLinkedTickets(tags) {
  var linkedTickets = [];
  for (i=0; i < tags.length; i++) {
    if (tags[i].startsWith('lnkt:')) {
      linkedTickets.push(tags[i]);
    }
  }
  if (debug) {
    console.log('Linked tickets:')
    console.log(linkedTickets);
  }
  return linkedTickets;
}

function getLinkedTicketDetail(client, linkedTickets) {
  var raw_ids = [];
  for (i=0; i < linkedTickets.length; i++) {
    raw_ids.push(linkedTickets[i].split(':')[2]);
  }
  raw_ids = raw_ids.join(',')
  if (debug) {
    console.log('Raw tickets IDs are:');
    console.log(raw_ids);
  }
  var settings = {
    url: '/api/v2/tickets/show_many.json?ids=' + raw_ids,
    type: 'GET',
    dataType: 'json',
  };

  client.request(settings).then(
    function(data) {
      if (debug) {
        console.log('Raw API return value:');
        console.log(data);
        console.log('Calling showLinkedTickets');
      }
      showLinkedTickets(linkedTickets, data['tickets']);
    },
    function(response) {
      showApiError(response);
    }
  );
}

function showLinkedTickets(linkedTickets, data) {
  var display_data = {};
  for (i=0; i < linkedTickets.length; i++){
    if (debug) {
      console.log('Current linkedTicket object:');
      console.log(linkedTickets[i]);
    }
    var id = linkedTickets[i].split(':')[2]
    var relationship = linkedTickets[i].split(':')[1]
    var ticket_data = {}
    for (x=0; x < data.length; x++) {
      if (data[x]['id'] == id) {
        if (debug) {
          console.log('Found matching ticket in data');
          console.log(data[x]);
        }
        ticket_data = data[x]
      }
    }
    display_data[i] = {
      'id': id,
      'relationship': translateRelationship(relationship),
      'relationshipCode': relationship,
      'subject': ticket_data['subject']
    }
  }

  if (debug) { console.log(display_data); }
  var display_info = {
    'ticket': display_data
  }
  var source = $("#linked-ticket-template").html();
  var template = Handlebars.compile(source);
  var html = template(display_info);
  $("#content").html(html);
}

function showApiError(response) {
  var error_data = {
    'status': response.status,
    'statusText': response.statusText
  };
  var source = $("#error-template").html();
  var template = Handlebars.compile(source);
  var html = template(error_data);
  $("#content").html(html);
}

function showNoLinkedTickets() {
  var source = $("#no-ticket-template").html();
  var template = Handlebars.compile(source);
  var html = template();
  $("#content").html(html);
}

function getSearchResults() {
  $('#candidate-ticket-loading-icon').show()

  var client = ZAFClient.init();
  var query = $("#linked-ticket-search").val();
  var settings = {
    url: '/api/v2/search.json?query=type:ticket ' + query,
    type: 'GET',
    dataType: 'json',
  };

  client.request(settings).then(
    function(data) {
      if (debug) {
        console.log('Raw API return value:');
        console.log(data);
        console.log('Calling showSearchResults');
      }
      $('#candidate-ticket-loading-icon').hide();
      showSearchResults(data['results']);
    },
    function(response) {
      $('#candidate-ticket-loading-icon').hide();
      showApiError(response);
    }
  );
}

function showSearchResults(data) {
  var display_data = {};
  if (debug) { console.log(data); }
  for (i=0; i < data.length; i++){
    display_data[data[i]['id']] = {
      'id': data[i]['id'],
      'subject': data[i]['subject']
    }
  }

  if (debug) { console.log(display_data); }
  var display_info = {
    'ticket': display_data
  }
  var source = $("#candidate-ticket-template").html();
  var template = Handlebars.compile(source);
  var html = template(display_info);
  $("#candidate-tickets").html(html);
}

function linkTicket(id, relationship) {
  var client = ZAFClient.init();
  client.get('ticket.id').then(function(data) {
    var this_ticket_id = data['ticket.id'];
    if (debug) {
      console.log('External ID is ' + id + ' and inverted relationship is ' + invertRelationship(relationship));
      console.log('This ticket ID is ' + this_ticket_id + ' and relationship is ' + relationship);
    }
    var externalTicketTagText = 'lnkt:' + invertRelationship(relationship) + ':' + this_ticket_id;
    var thisTicketTagText = 'lnkt:' + relationship + ':' + id;
    if (debug) {
      console.log(externalTicketTagText);
      console.log(thisTicketTagText);
    }

    var errors = 0;

    client.request({
      url: '/api/v2/tickets/' + id + '/tags.json',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        "tags": [externalTicketTagText]
      })
    }).then(
      function(data, response) {
        if (debug) {
          console.log(data);
          console.log(response);
        }
      },
      function(data, response) {
        if (debug) {
          console.log(data);
          console.log(response);
        }
        errors++;
      }
    )

    client.request({
      url: '/api/v2/tickets/' + this_ticket_id + '/tags.json',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        "tags": [thisTicketTagText]
      })
    }).then(
      function(data, response) {
        if (debug) {
          console.log(data);
          console.log(response);
        }
      },
      function(data, response) {
        if (debug) {
          console.log(data);
          console.log(response);
        }
        errors++;
      }
    )

    if(errors == 0){
      $("#candidate-tickets").html('<h2>Linked successfully!</h2>');
      setTimeout(processLinkedTickets, 1500);
    }
    else {
      $("#candidate-tickets").html('<h2>Error when linking tickets!</h2>');
    }
  })
}

function unlinkTicket(id, relationship) {
  var client = ZAFClient.init();
  client.get('ticket.id').then(function(data) {
    var this_ticket_id = data['ticket.id'];
    if (debug) {
      console.log('External ID is ' + id + ' and inverted relationship is ' + invertRelationship(relationship));
      console.log('This ticket ID is ' + this_ticket_id + ' and relationship is ' + relationship);
    }
    var externalTicketTagText = 'lnkt:' + invertRelationship(relationship) + ':' + this_ticket_id;
    var thisTicketTagText = 'lnkt:' + relationship + ':' + id;
    if (debug) {
      console.log(externalTicketTagText);
      console.log(thisTicketTagText);
    }

    var errors = 0;

    client.request({
      url: '/api/v2/tickets/' + id + '/tags.json',
      type: 'DELETE',
      contentType: 'application/json',
      data: JSON.stringify({
        "tags": [externalTicketTagText]
      })
    }).then(
      function(data, response) {
        if (debug) {
          console.log(data);
          console.log(response);
        }
      },
      function(data, response) {
        if (debug) {
          console.log(data);
          console.log(response);
        }
        errors++;
      }
    )

    client.request({
      url: '/api/v2/tickets/' + this_ticket_id + '/tags.json',
      type: 'DELETE',
      contentType: 'application/json',
      data: JSON.stringify({
        "tags": [thisTicketTagText]
      })
    }).then(
      function(data, response) {
        if (debug) {
          console.log(data);
          console.log(response);
        }
      },
      function(data, response) {
        if (debug) {
          console.log(data);
          console.log(response);
        }
        errors++;
      }
    )

    if(errors == 0){
      $("#candidate-tickets").html('<h2>Unlinked successfully!</h2>');
      setTimeout(processLinkedTickets, 1500);
    }
    else {
      $("#candidate-tickets").html('<h2>Error when unlinking tickets!</h2>');
    }
  })
}

function invertRelationship(relationshipCode) {
  var invertedRelationships = {
    'blckdby': 'blcks',
    'blcks': 'blckdby',
    'prnt': 'chld',
    'chld': 'prnt',
    'rlts': 'rlts'
  }

  return invertedRelationships[relationshipCode]
}

function translateRelationship(relationshipCode) {
  var relationships = {
    'blckdby': 'Blocked By',
    'blcks': 'Blocks',
    'prnt': 'Is Parent',
    'chld': 'Is Child',
    'rlts': 'Relates To'
  }

  return relationships[relationshipCode]
}

function openTicket(id){
  var client = ZAFClient.init();
  client.invoke('routeTo', 'ticket', id);
}
