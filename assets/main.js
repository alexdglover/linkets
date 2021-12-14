$(() => {
  const client = ZAFClient.init();
  client.invoke("resize", { width: "320px", height: "400px" });
  client.context().then((data) => {
    const origin = `https://${data["account"]["subdomain"]}.zendesk.com`;
  });
  processLinkedTickets();
});

processLinkedTickets = () => {
  // Clear any populated divs first
  $("#candidate-tickets").html("");
  $("#content").html("");

  const client = ZAFClient.init();

  client.get("ticket.tags").then((data) => {
    const tags = data["ticket.tags"];
    const linkedTickets = parseLinkedTickets(tags);

    if (linkedTickets.length == 0) showNoLinkedTickets();
    else getLinkedTicketDetail(client, linkedTickets);
  });
};

parseLinkedTickets = (tags) => {
  let linkedTickets = [];

  tags.map((tag) => {
    if (tag.startsWith("lnkt:")) linkedTickets.push(tag);
  });

  return linkedTickets;
};

getLinkedTicketDetail = (client, linkedTickets) => {
  let raw_ids = [];

  linkedTickets.map((ticket) => {
    raw_ids.push(ticket.split(":")[2]);
  });

  raw_ids = raw_ids.join(",");
  const settings = {
    url: "/api/v2/tickets/show_many.json?ids=" + raw_ids,
    type: "GET",
    dataType: "json",
  };

  client.request(settings).then(
    (data) => showLinkedTickets(linkedTickets, data["tickets"]),
    (error) => showApiError(error)
  );
};

showLinkedTickets = (linkedTickets, data) => {
  let display_data = {};

  linkedTickets.map((ticket, index) => {
    const id = ticket.split(":")[2];
    const relationship = ticket.split(":")[1];
    let ticket_data = {};

    data.map((record) => {
      if (record["id"] == id) ticket_data = record;
    });

    display_data[index] = {
      id: id,
      relationship: translateRelationship(relationship),
      relationshipCode: relationship,
      subject: ticket_data["subject"],
      status: ticket_data["status"],
    };
  });

  const display_info = {
    ticket: display_data,
  };
  const source = $("#linked-ticket-template").html();
  const template = Handlebars.compile(source);
  const html = template(display_info);

  $("#content").html(html);
};

showApiError = (response) => {
  const error_data = {
    status: response.status,
    statusText: response.statusText,
  };
  const source = $("#error-template").html();
  const template = Handlebars.compile(source);
  const html = template(error_data);
  $("#content").html(html);
};

showNoLinkedTickets = () => {
  const source = $("#no-ticket-template").html();
  const template = Handlebars.compile(source);
  const html = template();
  $("#content").html(html);
};

getSearchResults = () => {
  $("#candidate-ticket-loading-icon").show();

  const client = ZAFClient.init();
  const query = $("#linked-ticket-search").val();
  const settings = {
    url: "/api/v2/search.json?query=type:ticket " + query,
    type: "GET",
    dataType: "json",
  };

  client.request(settings).then(
    (data) => {
      $("#candidate-ticket-loading-icon").hide();
      showSearchResults(data["results"]);
    },
    (error) => {
      $("#candidate-ticket-loading-icon").hide();
      showApiError(error);
    }
  );
};

showSearchResults = (data) => {
  let display_data = {};

  data.map((item) => {
    display_data[item["id"]] = {
      id: item["id"],
      subject: item["subject"],
      status: item["status"],
    };
  });

  const display_info = {
    ticket: display_data,
  };
  const source = $("#candidate-ticket-template").html();
  const template = Handlebars.compile(source);
  const html = template(display_info);
  $("#candidate-tickets").html(html);
};

linkTicket = (id, relationship) => {
  const client = ZAFClient.init();
  client.get("ticket.id").then((data) => {
    const this_ticket_id = data["ticket.id"];
    const externalTicketTagText = `lnkt:${invertRelationship(
      relationship
    )}:${this_ticket_id}`;
    const thisTicketTagText = `lnkt:${relationship}:${id}`;

    const pairedTicketUpdate = client.request({
      url: "/api/v2/tickets/" + id + "/tags.json",
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify({
        tags: [externalTicketTagText],
      }),
    });

    const selectedTicketUpdate = client.request({
      url: "/api/v2/tickets/" + this_ticket_id + "/tags.json",
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify({
        tags: [thisTicketTagText],
      }),
    });

    Promise.all([pairedTicketUpdate, selectedTicketUpdate])
      .then((values) => {
        $("#candidate-tickets").html("<h2>Linked successfully!</h2>");
        setTimeout(processLinkedTickets, 3500);
      })
      .catch((error) => {
        $("#candidate-tickets").html("<h2>Error when linking tickets!</h2>");
      });
  });
};

unlinkTicket = (id, relationship) => {
  const client = ZAFClient.init();
  client.get("ticket.id").then(function (data) {
    const this_ticket_id = data["ticket.id"];
    const externalTicketTagText =
      "lnkt:" + invertRelationship(relationship) + ":" + this_ticket_id;
    const thisTicketTagText = "lnkt:" + relationship + ":" + id;

    const pairedTicketUpdate = client.request({
      url: "/api/v2/tickets/" + id + "/tags.json",
      type: "DELETE",
      contentType: "application/json",
      data: JSON.stringify({
        tags: [externalTicketTagText],
      }),
    });

    const selectedTicketUpdate = client.request({
      url: "/api/v2/tickets/" + this_ticket_id + "/tags.json",
      type: "DELETE",
      contentType: "application/json",
      data: JSON.stringify({
        tags: [thisTicketTagText],
      }),
    });

    Promise.all([pairedTicketUpdate, selectedTicketUpdate])
      .then((values) => {
        $("#candidate-tickets").html("<h2>Unlinked successfully!</h2>");
        setTimeout(processLinkedTickets, 3500);
      })
      .catch((error) => {
        $("#candidate-tickets").html("<h2>Error when unlinking tickets!</h2>");
      });
  });
};

invertRelationship = (relationshipCode) => {
  const invertedRelationships = {
    blckdby: "blcks",
    blcks: "blckdby",
    prnt: "chld",
    chld: "prnt",
    rlts: "rlts",
  };

  return invertedRelationships[relationshipCode];
};

translateRelationship = (relationshipCode) => {
  const relationships = {
    blckdby: "Blocked By",
    blcks: "Blocks",
    prnt: "Parent",
    chld: "Child",
    rlts: "Relates To",
  };

  return relationships[relationshipCode];
};

openTicket = (id) => {
  const client = ZAFClient.init();
  client.invoke("routeTo", "ticket", id);
};
