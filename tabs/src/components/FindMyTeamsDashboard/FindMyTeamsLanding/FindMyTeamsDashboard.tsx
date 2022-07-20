import { useState, useEffect } from "react";
import { Menu, Segment, Divider } from "@fluentui/react-northstar";
import "./FindMyTeamsDashboard.css";
import { SearchTeams } from "../SearchTeams/SearchTeams";
import { SortMyTeams } from "../SortMyTeams/SortMyTeams";
import { GroupByTeams } from "../GroupByTeams/GroupByTeams"
import { AllMyTeams } from "../AllMyTeams/AllMyTeams";
import { AllMyTeamsGroups } from "../AllMyTeamsGroups/AllMyTeamsGroups"
import constants from "../../Services/lib/constants.json";

export default function FindMyTeamsDashboard(props: { data: any, allTags: any, loading: any, localStorageLoading: any }) {
    const { data, allTags, loading, localStorageLoading } = props;
    const [myTeamsData, getMyTeamsData] = useState(
        {
            sortByOption: constants.SortByOptions.teamAZ,
            groupByOption: "None",
            hasGroupByOptionsChanged: false,
            hasSortOptionsChanged: false,
            tileDirection: "",
            allTeamsData: [],
            allOwnerTeamsData: [],
            allMemberTeamsData: [],
            allTagsData: [],
            selectedMenuItem: 0,
            searchText: ""
        });
    const [searchText, getSearchText] = useState("");
    const [reqTeamData, getReqTeamData] = useState([...myTeamsData.allTeamsData]);
    const [groupedData, getReqGroupedData] = useState<any>([{ tag: "", teams: [] }]);
    const [isSearchResults, getSearchResult] = useState(true);
    const [isPopupOpen, getIsPopupOpen] = useState(false);
    const steps = [constants.FilterOptions.allMyTeams, constants.FilterOptions.ownerOf, constants.FilterOptions.memberOf];
    const items = steps.map((step, idx) => {
        return {
            key: idx,
            content: step,
            onClick: () => getMyTeamsData({ ...myTeamsData, selectedMenuItem: idx })
        };
    });
    const sortingAndGrouping = (teamsData: any) => {
        let reqGroupedData: any[] = [];
        if (myTeamsData.hasGroupByOptionsChanged) {
            //groupBy code will come here
            if (myTeamsData.groupByOption === "Tags") {
                teamsData.map((teamData: any) => {
                    teamData.tags?.split(",").map((tag: any) => {
                        if (allTags?.allTags.includes(tag)) {
                            reqGroupedData.push({ "tag": tag, teamData })
                        }
                    })
                })
                let reqData = allTags?.allTags.map((t: any) => {
                    let data = reqGroupedData.filter((d: any) => d.tag === t);
                    if (myTeamsData.sortByOption === constants.SortByOptions.teamAZ) {
                        getReqGroupedData(data.sort((a: any, b: any) => a.teamData.displayName.localeCompare(b.teamData.displayName)));
                    }
                    else {
                        getReqGroupedData(data.sort((a: any, b: any) => b.teamData.displayName.localeCompare(a.teamData.displayName)));
                    }
                    return { "tag": t, "teams": data }
                })
                getReqGroupedData(reqData);
            }
            if (myTeamsData.groupByOption === " None") {
                getMyTeamsData({ ...myTeamsData, hasGroupByOptionsChanged: false, hasSortOptionsChanged: true })
            }
        }
        else {
            //sortBy code will come here
            if (myTeamsData.sortByOption === constants.SortByOptions.teamAZ) {
                getReqTeamData(teamsData.sort((a: any, b: any) => a.displayName.localeCompare(b.displayName)));
            }
            else {
                getReqTeamData(teamsData.sort((a: any, b: any) => b.displayName.localeCompare(a.displayName)));
            }
        }
    };

    useEffect(() => {
        let mainDivElement = Array.from(document.getElementsByClassName('mainDiv') as HTMLCollectionOf<HTMLElement>);
        let bodyElement = Array.from(document.getElementsByTagName('body') as HTMLCollectionOf<HTMLElement>);
        let UiProviderElement = Array.from(document.getElementsByClassName('ui-provider') as HTMLCollectionOf<HTMLElement>);
        let searchElement = Array.from(document.getElementsByTagName('input') as HTMLCollectionOf<HTMLElement>);
        window.scrollTo(0, 0);
        mainDivElement[0].style.pointerEvents = (isPopupOpen) ? "none" : "";
        if (isPopupOpen) {
            mainDivElement[0].style.backgroundColor = "#00000024";
            bodyElement[0].style.backgroundColor = "#00000024";
            searchElement[0].style.backgroundColor = "initial";
        }
        else {
            mainDivElement[0].style.marginLeft = "2.5rem";
            mainDivElement[0].style.backgroundColor = "inherit";
            bodyElement[0].style.backgroundColor = "inherit";
            UiProviderElement[0].style.backgroundColor = "inherit";
            UiProviderElement[0].style.background = "inherit";
            searchElement[0].style.backgroundColor = "";
        }
    }, [isPopupOpen]);

    useEffect(() => {
        let filteredTeamData = [];
        if (myTeamsData?.allTeamsData) {
            let reqTeams = [] as any;
            switch (myTeamsData.selectedMenuItem) {
                case 0:
                    reqTeams = [...myTeamsData.allTeamsData]
                    break;
                case 1:
                    reqTeams = [...myTeamsData.allOwnerTeamsData]
                    break;
                case 2:
                    reqTeams = [...myTeamsData.allMemberTeamsData]
                    break;
                default:
                    break;
            }
            if (searchText !== "") {
                filteredTeamData = reqTeams.filter((itm: any, idx: number) => {
                    return itm.displayName.toUpperCase().indexOf(searchText) > -1 || itm.description.toUpperCase().indexOf(searchText) > -1 || itm.tags?.toUpperCase().indexOf(searchText) > -1;
                });
                sortingAndGrouping(filteredTeamData);
                getReqTeamData(filteredTeamData);
                (filteredTeamData.length === 0) ? getSearchResult(false) : getSearchResult(true);
            }
            else {
                sortingAndGrouping(reqTeams);
                getSearchResult(true);
            }
        }
    }, [searchText, myTeamsData.sortByOption, myTeamsData.groupByOption, myTeamsData.allTeamsData, myTeamsData.selectedMenuItem]);

    useEffect(() => {
        if (data?.teamMembersData) {
            let ownerTeams = data?.teamMembersData.filter((itm: any, idx: number) => itm.userRole);
            let memberTeams = data?.teamMembersData.filter((itm: any, idx: number) => !(itm.userRole));
            getMyTeamsData({
                ...myTeamsData,
                allTeamsData: data?.teamMembersData,
                allOwnerTeamsData: ownerTeams,
                allMemberTeamsData: memberTeams
            });
        }

    }, [data?.teamMembersData]);

    let items1 = [
        {
            key: 'rows',
            content: 'Rows',
        },
        {
            key: 'columns',
            content: 'Columns',
        }
    ]
    const handleTileDirection = (e: any, data: any) => {
        getMyTeamsData({ ...myTeamsData, tileDirection: data.content });
    }
    return (
        <div className="narrow ">
            <Segment className="topNav" >
                <Menu defaultActiveIndex={0} items={items} underlined secondary />
                <div>
                    <SearchTeams getSearchText={getSearchText} />
                    <div>
                        <div className="groupByMenu" style={{ display: myTeamsData.hasGroupByOptionsChanged ? "flex" : "none" }}>
                            <Menu defaultActiveIndex={0} items={items1} underlined secondary onItemClick={handleTileDirection} />
                            <div><Divider vertical style={{ flexDirection: "column", width: "5px", margin: "0 0.5rem" }} /></div>
                        </div>

                        <GroupByTeams
                            getGroupByOption={getMyTeamsData}
                            groupByOption={myTeamsData.groupByOption}
                            myTeamsData={myTeamsData}
                        />
                        <SortMyTeams
                            getSortByOption={getMyTeamsData}
                            sortByOption={myTeamsData.sortByOption}
                            myTeamsData={myTeamsData}
                        />
                    </div>
                </div>
            </Segment>
            {
                myTeamsData.hasGroupByOptionsChanged ?
                    <AllMyTeamsGroups
                        loading={loading}
                        localStorageLoading={localStorageLoading}
                        isSearchResults={isSearchResults}
                        reqGroupedData={groupedData}
                        myTeamsData={myTeamsData}
                        getIsPopupOpen={getIsPopupOpen}
                        tileDirection={myTeamsData.tileDirection}
                    />
                    : <AllMyTeams
                        loading={loading}
                        localStorageLoading={localStorageLoading}
                        isSearchResults={isSearchResults}
                        reqTeamData={reqTeamData}
                        getIsPopupOpen={getIsPopupOpen}
                        tileDirection={myTeamsData.tileDirection}
                    />
            }

        </div>
    );
}