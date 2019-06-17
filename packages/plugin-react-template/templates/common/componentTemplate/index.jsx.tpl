import PropTypes from 'prop-types';
import React from 'react';
import './index.scss';
<% if(useConnect) { %>
import { connect } from 'react-redux';
import { pick } from 'lodash';
<% } %>

function <%= name %>({ name }) {
  return (
    <div className="<%= className %>">
      <%= name %>:
      {name}
    </div>
  );
}

<%= name %>.propTypes = {
  name: PropTypes.string,
};
<%= name %>.defaultProps = {
  name: null,
};
<% if(useConnect) { %>
export default connect(
  state => {
    // pick state
    return pick(state,['name']);
  },
  {
    // 添加action
  }
)(<%= name %>);
<% } %>
<% if(!useConnect) { %>
export default <%= name %>;
<% } %>
