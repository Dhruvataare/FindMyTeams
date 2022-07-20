import "./AllMyTeams.css";
import { TeamInfoTile } from "../TeamInfoTile/TeamInfoTile";

export function AllMyTeams(props: { loading?: boolean, localStorageLoading?: boolean, isSearchResults?: boolean, reqTeamData?: any, getIsPopupOpen?: any,tileDirection?:string }) {
    const { loading, localStorageLoading, isSearchResults, reqTeamData, getIsPopupOpen,tileDirection } = { ...props, };


    return (
        <div className="sections">
            {isSearchResults ?
                <div className="tileContainer">
                    <TeamInfoTile
                        allTeamsData={reqTeamData}
                        loading={loading}
                        localStorageLoading={localStorageLoading}
                        getIsPopupOpen={getIsPopupOpen}
                        isGroupByActive={false}
                        tileDirection={tileDirection}
                    />
                </div>
                : <div className="NoResultsMessage">Oops!! No Results Found.</div>
            }
        </div>
    );
}
