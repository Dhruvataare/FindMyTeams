import { useState, useEffect } from "react";
import "./ManageMyTeams.css";
import { Alert } from "@fluentui/react-northstar";
import { ManageMyTeamsTable } from '../ManageMyTeamsTable/ManageMyTeamsTable';
import constants from "../../Services/lib/constants.json";
import { ManageMyTeamsMenu } from "../ManageMyTeamsMenu/ManageMyTeamsMenu";

export function ManageMyTeams(props: { data: any, allTags: any, loading: any, localStorageLoading: any }) {
    const { data, allTags, loading, localStorageLoading } = props;
    // let allteamsData: any;
    const [manageMyTeamsState, getManageMyTeamsState] = useState({
        isAlertVisible: false,
        alertMessage: '',
        isPopupOpen: false,
        allTags: allTags
    });
    const [selectedMenuOption, getSelectedMenuOption] = useState("Membership");
    const membershipTableheader = {
        items: [{ field: constants.TeamsHeader.fieldTeamName, headerName: constants.TeamsHeader.headerTeamName, width: 350 },
        { field: constants.TeamsHeader.fieldTeamDescription, headerName: constants.TeamsHeader.headerNameDescription, width: 400 },
        { field: constants.TeamsHeader.fieldcreatedDate, headerName: constants.TeamsHeader.headerCreatedDate, width: 300 }
        ]
    };
    const tagsTableheader = {
        items: [{ field: constants.TeamsHeader.fieldTeamName, headerName: constants.TeamsHeader.headerTeamName, width: 350 },
        { field: constants.TeamsHeader.fieldcreatedDate, headerName: constants.TeamsHeader.headerCreatedDate, width: 300 },
        { field: constants.TeamsHeader.fieldTeamTags, headerName: constants.TeamsHeader.headerTeamTags, width: 400 },
        ]
    };

    let allteamsData = data?.manageTeamsData.map((team: any, idx: number) => (
        {
            key: team.id,
            id: team.id,
            teamName: team.displayName,
            teamDescription: team.description,
            userRole: team.userRole,
            created: new Date(team.createdDateTime).toDateString(),
            tags: team.tags !== undefined ? team.tags.toString() : undefined
            // tags: team.tags.length > 0 ? team.tags.toString() : "No tags available"
        }
    ));
    const [teamsData, getTeamsData] = useState<any>(allteamsData);
    useEffect(() => {
        getTeamsData(allteamsData);
    }, []);

    useEffect(() => {
        let containerElement = Array.from(document.getElementsByClassName('ManageTeamsContainer') as HTMLCollectionOf<HTMLElement>);
        let tableHeaderElement = Array.from(document.getElementsByClassName('ManageTeamsTableHeader') as HTMLCollectionOf<HTMLElement>);
        let bodyElement = Array.from(document.getElementsByTagName('body') as HTMLCollectionOf<HTMLElement>);
        window.scrollTo(0, 0);

        containerElement[0].style.backgroundColor = (manageMyTeamsState.isPopupOpen) ? "#00000024" : "";
        containerElement[0].style.pointerEvents = (manageMyTeamsState.isPopupOpen) ? "none" : "";
        bodyElement[0].style.backgroundColor = (manageMyTeamsState.isPopupOpen) ? "#00000024" : "";
        if (tableHeaderElement.length > 0) tableHeaderElement[0].style.backgroundColor = (manageMyTeamsState.isPopupOpen) ? "rgba(98,100,167,0.14)" : "";
    }, [manageMyTeamsState.isPopupOpen]);

    return (
        <div className="ManageTeamsContainer">
            <div className="ManageTeamsTopMargin"></div>
            <div className="ManageTeams">
                <div className="ManageTeamsBody">
                    <div className="ManageMenuContainer" >
                        <ManageMyTeamsMenu
                            data={data}
                            localStorageLoading={localStorageLoading}
                            getSelectedMenuOption={getSelectedMenuOption}
                        />
                    </div>
                    {<div className="ManageTeamsTable">
                        {(manageMyTeamsState.isAlertVisible) && _renderUserAlert(manageMyTeamsState)}
                        {
                            <ManageMyTeamsTable
                                header={selectedMenuOption === "Membership" ? membershipTableheader : tagsTableheader}
                                rows={teamsData === false || teamsData?.length === 0 ? allteamsData : teamsData}
                                manageMyTeamsState={manageMyTeamsState}
                                getManageMyTeamsState={getManageMyTeamsState}
                                data={data}
                                localStorageLoading={localStorageLoading}
                                selectedMenuOption={selectedMenuOption}
                            />
                        }
                    </div>
                    }

                </div>
            </div >
        </div>
    )

}
const _renderUserAlert = (manageMyTeamsState: any) => {
    return <Alert success content={manageMyTeamsState.alertMessage} className="UsersAlert" />
}
