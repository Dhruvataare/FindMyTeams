import { useState, useEffect } from "react";
import "./TeamInfoTileUsers.css";
import { Segment, Skeleton, Text, Flex, FlexItem, Button, Input } from "@fluentui/react-northstar";
import { DataGrid, GridRenderCellParams,GridColumns } from '@mui/x-data-grid';
import { SearchIcon, CloseIcon, UserFriendsIcon } from '@fluentui/react-icons-northstar';
import { GetAllUsersOfTeam } from '../../Services/FindMyTeamsServices/FindMyTeamsServices';
import constant from "../../Services/lib/constants.json";

export function UsersPortal(props: { teamData?: any, getIsPopupOpen?: any, togglePortal?: any, setExecute?: any, closePortal?: any }) {
    const { teamData, closePortal } = { ...props };
    const [usersSearchValue, getUsersSearchValue] = useState("");
    const [isSearchResults, getSearchResult] = useState(true);
    const [pageSize, setPageSize] = useState<number>(10);

    // const header = {
    let headerColumns: GridColumns<any> =
        [
            {
                field: 'headerName',
                headerName: 'Name',
                sortable: true,
                flex: 1,
                sortComparator: (v1: any, v2: any) => v1.displayName.localeCompare(v2.displayName),
                sortingOrder: ['desc', 'asc'],
                renderCell: (user: GridRenderCellParams<any>) => {
                    return <a
                        target="_blank"
                        rel="noreferrer"
                        title={user.value.displayName}
                        style={{ textDecoration: "none", color: "inherit" }}
                        href={`https://teams.microsoft.com/l/chat/0/0?users=${user.value.userPrincipalName}`}>
                        {user.value.displayName}
                    </a>
                }
            },
            {
                field: 'jobTitle',
                headerName: 'Job Title',
                flex: 1
            },
            {
                field: 'headerEmail',
                headerName: 'Email',
                flex: 1,
                sortingOrder: ['desc', 'asc'],
                sortComparator: (v1: any, v2: any) => v1.userPrincipalName.localeCompare(v2.userPrincipalName),
                renderCell: (user: GridRenderCellParams<any>) => {
                    return <a target="_blank" rel="noreferrer" title={user.value.userPrincipalName} style={{ textDecoration: "none", color: "inherit" }} href={`mailto:${user.value.userPrincipalName}`}>{user.value.userPrincipalName}</a>
                }
            }]
    // }
    const { data, loading, error, reload } = GetAllUsersOfTeam(teamData);
    let allUsers = (loading === false) && data?.users.value.map((user: any, idx: number) => (
        {
            key: user.id,
            id: user.id,
            headerName: user,
            name: user.displayName,
            jobTitle: user.jobTitle === null ? "" : user.jobTitle,
            email: user.userPrincipalName,
            headerEmail: user
        }
    ));
    const [users, getUsers] = useState(allUsers && allUsers);

    useEffect(() => {
        getUsers(allUsers);
    }, []);

    useEffect(() => {
        let filteredUsersData = [];
        if (data?.users.value) {
            if (usersSearchValue !== "") {
                filteredUsersData = [...allUsers].filter((itm: any, idx: number) => {
                    return itm.name.toUpperCase().indexOf(usersSearchValue) > -1
                });
                getUsers(filteredUsersData);
                (filteredUsersData.length === 0) ? getSearchResult(false) : getSearchResult(true);
            }
            else {
                getUsers(allUsers);
                getSearchResult(true);
            }
        }
    }, [usersSearchValue]);

    const onKeyPress = (e: any) => {
        let keyValue = e.target.value;
        if (e.keyCode === 13) {
            getUsersSearchValue(keyValue.toUpperCase());
        }
        if (e.keyCode === 8 && e.target.defaultValue.length === 1) {
            getUsersSearchValue("");
        }

    }
    const onSearchTextDelete = (e: any, data: any) => {
        if (data.value === "") getUsersSearchValue("");
    }
    return (
        <div  >
            <div className="PortalContent">
                <Segment inverted color={teamData.headerColor} className="UserPortalHeader">
                    <Flex gap="gap.small">
                        <Text content={data?.teamName} className="teamName" align="center" size="medium" weight="bold" />
                        <FlexItem push>
                            <Button
                                icon={<CloseIcon />}
                                className="closeButton"
                                text
                                iconOnly
                                title="Close"
                                onClick={closePortal}
                            />
                        </FlexItem>
                    </Flex>
                </Segment>
                <Segment >
                    <Flex gap="gap.small" vAlign="center" padding="padding.medium">

                        <UserFriendsIcon outline className="modalIcon" />
                        <Text content="Users" align="center" size="large" weight="semibold" />
                        <FlexItem push size="size.half">
                            <Input
                                clearable
                                fluid
                                icon={<SearchIcon />}
                                placeholder={constant.SearchUserPlaceHolder}
                                onKeyDown={onKeyPress}
                                onChange={onSearchTextDelete}
                            />
                        </FlexItem>
                    </Flex>
                    <div className="UserPortalTable">
                        {loading ?
                            <Skeleton animation="pulse" style={{ marginTop: "1rem" }}>
                                <Skeleton.Line height="3rem" />
                                <Skeleton.Line height="3rem" />
                                <Skeleton.Line height="3rem" />
                                <Skeleton.Line height="3rem" />
                                <Skeleton.Line height="3rem" />
                                <Skeleton.Line height="3rem" />
                            </Skeleton>
                            : isSearchResults
                                ?
                                <div style={{ height: 410, margin: '1rem 1.2rem' }}>
                                    <DataGrid
                                        rows={users === false ? allUsers : users}
                                        columns={headerColumns}
                                        pageSize={pageSize}
                                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                        rowsPerPageOptions={[10, 25, 50]}
                                        disableColumnMenu
                                    />
                                </div>
                                : <div className="NoResultsMessage">Oops!! No Results Found.</div>
                        }
                    </div>
                </Segment>
            </div>
        </div>
    );
}
