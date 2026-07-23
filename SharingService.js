/** FamilyPD OS link-based household and item sharing. */
const FPDSharingServiceV114 = (function () {
  'use strict';
  const INVITE_PREFIX = 'FPD_INVITE_';
  const ITEM_PREFIX = 'FPD_SHARED_ITEM_';
  const CONNECTION_KEY = 'FPD_CONNECTED_HOUSEHOLD_V114';
  const RECEIVED_KEY = 'FPD_RECEIVED_ITEMS_V114';

  function createHouseholdInvite() {
    requireRole_(FPD_CONFIG.ROLE.LEAD);
    const published = IdentityService.getPublishedVersion();
    if (!published || !published.exists) throw new Error('Create and publish the Family Profile before inviting members.');
    const pack = UpdatePackService.createPack();
    const token = token_();
    const profile = published.profile || {};
    const record = {
      kind: 'household-invite', token: token,
      householdLabel: clean_(profile.label || profile.householdLabel || 'FamilyPD Household'),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      packContent: pack.content
    };
    PropertiesService.getScriptProperties().setProperty(INVITE_PREFIX + token, JSON.stringify(record));
    return {url: appUrl_() + '?join=' + encodeURIComponent(token), householdLabel: record.householdLabel, expiresAt: record.expiresAt};
  }

  function previewHouseholdInvite(token) {
    requireRole_(FPD_CONFIG.ROLE.MEMBER);
    const record = readToken_(INVITE_PREFIX, token);
    const preview = UpdatePackService.previewPack(record.packContent);
    return {valid:true, token:token, householdLabel:record.householdLabel, createdAt:record.createdAt, expiresAt:record.expiresAt, counts:preview.counts || {}, warning:preview.warning || ''};
  }

  function joinHousehold(token) {
    requireRole_(FPD_CONFIG.ROLE.MEMBER);
    const record = readToken_(INVITE_PREFIX, token);
    const result = UpdatePackService.applyPack(record.packContent, true);
    const connection = {token:token, householdLabel:record.householdLabel, joinedAt:new Date().toISOString(), householdId:result.householdId || ''};
    PropertiesService.getUserProperties().setProperty(CONNECTION_KEY, JSON.stringify(connection));
    return {success:true, connection:connection, message:'You joined ' + record.householdLabel + '. Shared household information is now available in FamilyPD OS.'};
  }

  function getConnectionStatus() {
    const raw = PropertiesService.getUserProperties().getProperty(CONNECTION_KEY);
    if (!raw) return {connected:false};
    try { return {connected:true, connection:JSON.parse(raw)}; } catch (e) { return {connected:false}; }
  }

  function disconnectHousehold() {
    PropertiesService.getUserProperties().deleteProperty(CONNECTION_KEY);
    if (typeof fpdDisconnectImportedHousehold === 'function') fpdDisconnectImportedHousehold();
    return {success:true, message:'Disconnected. Imported household information was removed. Your private projects, goals, and notes remain.'};
  }

  function listShareableItems() {
    const data = DataStoreService.readData() || {};
    const personal = data.personal || {};
    const shared = data.shared || {};
    const projects = readProjects_();
    const items = [];
    projects.forEach(function(p){ items.push({type:'project', id:p.id, title:p.title || 'Untitled project', status:p.status || ''}); });
    (personal.goals || []).forEach(function(g){ items.push({type:'goal', id:g.id, title:g.title || g.name || 'Personal goal', status:g.status || ''}); });
    const identity = IdentityService.getPublishedVersion();
    if (identity && identity.exists) items.unshift({type:'family-profile', id:'published', title:(identity.profile && (identity.profile.label || identity.profile.householdLabel)) || 'Published Family Profile', status:'Published'});
    (shared.sharedGoals || []).forEach(function(g){ items.push({type:'household-goal', id:g.id, title:g.title || g.name || 'Shared goal', status:g.status || ''}); });
    return items;
  }

  function createItemShare(type, id) {
    const item = resolveItem_(type, id);
    const token = token_();
    const record = {kind:'shared-item', token:token, type:type, title:item.title || 'Shared FamilyPD item', data:item, createdAt:new Date().toISOString(), expiresAt:new Date(Date.now()+30*86400000).toISOString()};
    PropertiesService.getScriptProperties().setProperty(ITEM_PREFIX + token, JSON.stringify(record));
    return {url:appUrl_() + '?shared=' + encodeURIComponent(token), type:type, title:record.title, expiresAt:record.expiresAt};
  }

  function previewItemShare(token) {
    const record = readToken_(ITEM_PREFIX, token);
    return {valid:true, token:token, type:record.type, title:record.title, createdAt:record.createdAt, expiresAt:record.expiresAt, data:record.data};
  }

  function importItemShare(token) {
    const record = readToken_(ITEM_PREFIX, token);
    const props = PropertiesService.getUserProperties();
    let rows = [];
    try { rows = JSON.parse(props.getProperty(RECEIVED_KEY) || '[]'); } catch(e) {}
    rows = rows.filter(function(x){ return x.token !== token; });
    rows.unshift({token:token, type:record.type, title:record.title, data:record.data, importedAt:new Date().toISOString()});
    props.setProperty(RECEIVED_KEY, JSON.stringify(rows.slice(0,25)));
    return {success:true, message:'Added to your FamilyPD dashboard.', item:rows[0]};
  }

  function listReceivedItems() {
    try { return JSON.parse(PropertiesService.getUserProperties().getProperty(RECEIVED_KEY) || '[]'); } catch(e) { return []; }
  }

  function resolveItem_(type,id) {
    if (type === 'project') {
      const p = readProjects_().filter(function(x){return x.id===id;})[0];
      if (!p) throw new Error('Project not found.');
      return sanitize_(p);
    }
    const data = DataStoreService.readData() || {};
    if (type === 'goal') {
      const g = ((data.personal||{}).goals||[]).filter(function(x){return x.id===id;})[0];
      if (!g) throw new Error('Goal not found.'); return sanitize_(g);
    }
    if (type === 'household-goal') {
      const g = ((data.shared||{}).sharedGoals||[]).filter(function(x){return x.id===id;})[0];
      if (!g) throw new Error('Household goal not found.'); return sanitize_(g);
    }
    if (type === 'family-profile') {
      const p = IdentityService.getPublishedVersion();
      if (!p || !p.exists) throw new Error('Publish the Family Profile first.');
      return {title:(p.profile.label||p.profile.householdLabel||'Family Profile'), profile:fpdSafeSharedProfile_(p)};
    }
    throw new Error('Choose a valid item to share.');
  }

  function readProjects_(){ try{return JSON.parse(PropertiesService.getUserProperties().getProperty('FPD_PROJECT_STUDIO_V11')||'[]');}catch(e){return [];} }
  function sanitize_(value){ return JSON.parse(JSON.stringify(value||{})); }
  function requireRole_(role){ const c=WorkspaceService.getCurrentContext(); if(!c||c.role!==role) throw new Error(role===FPD_CONFIG.ROLE.LEAD?'Only the Household Lead can do this.':'Join links are for Family Member workspaces.'); }
  function readToken_(prefix,token){ const raw=PropertiesService.getScriptProperties().getProperty(prefix+clean_(token)); if(!raw) throw new Error('This sharing link is invalid or no longer available.'); const r=JSON.parse(raw); if(r.expiresAt && new Date(r.expiresAt).getTime()<Date.now()) throw new Error('This sharing link has expired. Ask the sender to create a new link.'); return r; }
  function token_(){ return Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'').slice(0,8); }
  function appUrl_(){ const u=ScriptApp.getService().getUrl()||''; if(!u) throw new Error('Deploy FamilyPD OS as a web app first.'); return u; }
  function clean_(v){return v===null||v===undefined?'':String(v).trim();}
  return {createHouseholdInvite:createHouseholdInvite,previewHouseholdInvite:previewHouseholdInvite,joinHousehold:joinHousehold,getConnectionStatus:getConnectionStatus,disconnectHousehold:disconnectHousehold,listShareableItems:listShareableItems,createItemShare:createItemShare,previewItemShare:previewItemShare,importItemShare:importItemShare,listReceivedItems:listReceivedItems};
}());
