import { Grid, Segment, gridBehavior, Divider } from "@fluentui/react-northstar";
import './AllMyTeamsGroups.css';
import { TeamInfoTile } from "../TeamInfoTile/TeamInfoTile";

export function AllMyTeamsGroups(props: {
    loading: boolean, localStorageLoading: boolean, isSearchResults: boolean, myTeamsData?: any,
    reqGroupedData: any, getIsPopupOpen?: any, tileDirection?: string
}) {
    const { loading, localStorageLoading, isSearchResults, reqGroupedData, getIsPopupOpen, tileDirection } = props;

    const renderTeamGroups = () => {
        return isSearchResults ?
            reqGroupedData.map((data: any) => (
                <div>
                    <div className="group">
                        {data.teams.length > 0 ?
                            <>
                                <Segment className="tagTitle">{data.tag}</Segment>
                                <div className={tileDirection === "Columns" ? "tileColumnContainer columnTop" : "tileColumnContainer"}>
                                    <TeamInfoTile
                                        allTeamsData={data.teams}
                                        loading={loading}
                                        localStorageLoading={localStorageLoading}
                                        isGroupByActive={true}
                                        getIsPopupOpen={getIsPopupOpen}
                                        tileDirection={tileDirection}
                                    />
                                    <div style={{ display: tileDirection === "Columns" ? "none" : "block", marginTop: "1rem" }}>
                                        <Divider className="groupDivider" />
                                    </div>
                                </div>
                            </>
                            : <></>
                        }
                    </div>
                </div>
            ))
            : <div className="NoResultsMessage">Oops!! No Results Found.</div>
    }
    return (
        <Grid
            className={tileDirection === "Columns" ? "teamsGroups teamsGroupsColumns" : "teamsGroups teamsGroupsRows"}
            accessibility={gridBehavior} columns={reqGroupedData.length}
            content={renderTeamGroups()}
        />
    );
}
