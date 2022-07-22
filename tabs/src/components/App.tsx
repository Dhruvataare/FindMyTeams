// https://fluentsite.z22.web.core.windows.net/quick-start
import React, { useEffect, useState } from "react";
import { Provider, teamsTheme,Loader } from "@fluentui/react-northstar";
import { HashRouter as Router, Route } from "react-router-dom";
import { useTeamsFx } from "@microsoft/teamsfx-react";
import "./App.css";
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { TeamsFxContext } from "./Context";
import { GetAllTeams, GetAllTags } from './Services/FindMyTeamsServices/FindMyTeamsServices';
import { ManageMyTeams } from "./FindMyTeamsDashboard/ManageMyTeams/ManageMyTeams";
import FindMyTeamsDashboard from "./FindMyTeamsDashboard/FindMyTeamsLanding/FindMyTeamsDashboard";

/**
 * The main app which handles the initialization and routing
 * of the app.
 */
export default function App() {
  const { loading, theme, themeString, teamsfx } = useTeamsFx();
  const [localStorageLoading, setLocalStorageLoading] = useState(false);
  const { allTeamsData, allTeamsLoading, allTeamsError, allTeamsReload } = GetAllTeams();
  const { allTagsData, allTagsLoading, allTagsError, allTagsReload } = GetAllTags();
  let dashboardLocalStorageData = JSON.parse(localStorage.getItem('dashboardLocalStorageData') || '{"teamMembersData":[]}');
  let manageTeamsLocalStorageData = JSON.parse(localStorage.getItem('manageTeamsLocalStorageData') || '{"manageTeamsData":[]}');
  let allTagsLocalStorageData = JSON.parse(localStorage.getItem('allTagsLocalStorageData') || '{"allTags":[]}');
  // initializeIcons();
  useEffect(() => {
    initializeIcons();
  }, []);

  useEffect(() => {
    if (dashboardLocalStorageData.teamMembersDataLength === dashboardLocalStorageData.teamMembersData.length) {
      setLocalStorageLoading(false);
    }
    else {
      setLocalStorageLoading(true);
    }

  }, [dashboardLocalStorageData.teamMembersData.length]);
  return (
    <TeamsFxContext.Provider value={{ theme, themeString, teamsfx }}>
      <Provider theme={theme || teamsTheme} styles={{ backgroundColor: "#eeeeee" }}>
        <Router>
          {allTeamsLoading ? (
            <Loader style={{ margin: 100 }} />
          ) : (
            <>
              <Route
                exact
                path="/findMyTeamsDashboard"
                component={FindMyTeamsDashboard}
                children={
                  <FindMyTeamsDashboard
                    data={dashboardLocalStorageData.teamMembersData.length > 0 ? dashboardLocalStorageData : allTeamsData}
                    allTags={allTagsLocalStorageData.allTags.length > 0 ? allTagsLocalStorageData : allTagsData?.tags}
                    loading={allTeamsLoading}
                    localStorageLoading={localStorageLoading}
                  />}
              />
              <Route
                exact
                path="/manageMyTeams"
                component={ManageMyTeams}
                children={<ManageMyTeams
                  data={manageTeamsLocalStorageData.manageTeamsData.length > 0 ? manageTeamsLocalStorageData : allTeamsData}
                  allTags={allTagsLocalStorageData.allTags.length > 0 ? allTagsLocalStorageData : allTagsData?.tags}
                  loading={allTeamsLoading}
                  localStorageLoading={localStorageLoading}
                />}
              />
            </>
          )}
        </Router>
      </Provider>
    </TeamsFxContext.Provider>
  );
}
