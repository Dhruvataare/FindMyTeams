import { useState, useEffect } from "react";
import "./TeamInfoTileChannels.css";
import { Segment, Skeleton, Text, Flex, FlexItem, Button, Input } from "@fluentui/react-northstar";
import { DataGrid, GridRenderCellParams, GridColumns } from '@mui/x-data-grid';
import { SearchIcon, CloseIcon, BulletsIcon } from '@fluentui/react-icons-northstar';
import { GetAllChannels } from '../../Services/FindMyTeamsServices/FindMyTeamsServices';
import constant from "../../Services/lib/constants.json";

export function ChannelsPortal(props: { teamData?: any, getIsPopupOpen?: any, togglePortal?: any, setExecute?: any, closePortal?: any }) {
    const { teamData, closePortal } = { ...props };
    const [channelsSearchValue, getChannelsSearchValue] = useState("");
    const [isSearchResults, getSearchResult] = useState(true);
    const [pageSize, setPageSize] = useState<number>(10);
    let headerColumns: GridColumns<any> = [
        {
            field: 'headerName',
            headerName: 'Name',
            flex: 1,
            sortComparator: (v1: any, v2: any) => v1.displayName.localeCompare(v2.displayName),
            sortingOrder: ['desc', 'asc'],
            renderCell: (channel: GridRenderCellParams<any>) => {
                return <a target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }} href={`${channel.value.webUrl}`}>{channel.value.displayName}</a>
            }
        },
        {
            field: 'description',
            headerName: 'Description',
            flex: 1
        }
    ]

    const { data, loading, error, reload } = GetAllChannels(teamData);
    let allChannels = (loading === false) && data?.channels.value
        .map((channel: any) => ({
            key: channel.id,
            id: channel.id,
            headerName: channel,
            name: channel.displayName,
            description: channel.description === null ? "" : channel.description,
            favourite: channel.isFavoriteByDefault === true ? "Yes" : "No"
        }));
    const [channels, getChannels] = useState(allChannels && allChannels);

    useEffect(() => {
        getChannels(allChannels);
    }, []);

    useEffect(() => {
        let filteredChannelData = [];
        if (data?.channels.value) {
            if (channelsSearchValue !== "") {
                filteredChannelData = [...allChannels].filter((itm: any, idx: number) => {
                    return itm.name.toUpperCase().indexOf(channelsSearchValue) > -1
                });
                getChannels(filteredChannelData);
                (filteredChannelData.length === 0) ? getSearchResult(false) : getSearchResult(true);
            }
            else {
                getChannels(allChannels);
                getSearchResult(true);
            }
        }
    }, [channelsSearchValue]);

    const onKeyPress = (e: any) => {
        let keyValue = e.target.value;
        if (e.keyCode === 13) {
            getChannelsSearchValue(keyValue.toUpperCase());
        }
        if (e.keyCode === 8 && e.target.defaultValue.length === 1) {
            getChannelsSearchValue("");
        }

    }
    const onSearchTextDelete = (e: any, data: any) => {
        if (data.value === "") getChannelsSearchValue("");
    }

    return (
        <div  >
            <Segment inverted color={teamData.headerColor} className="ChannelsPortalHeader">
                <Flex gap="gap.small">
                    <Text content={teamData.displayName} className="teamName" align="center" size="medium" weight="bold" />
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

                    <BulletsIcon className="modalIcon" />
                    <Text content="Channels" align="center" size="large" weight="semibold" />
                    <FlexItem push size="size.half">
                        <Input
                            clearable
                            fluid
                            icon={<SearchIcon />}
                            placeholder={constant.SearchForChannelsHere}
                            onKeyDown={onKeyPress}
                            onChange={onSearchTextDelete}
                        />
                    </FlexItem>
                </Flex>
                <div className="ChannelsPortalTable">
                    {loading ?
                        <Skeleton animation="wave" style={{ marginTop: "1rem" }}>
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
                                    rows={channels === false ? allChannels : channels}
                                    columns={headerColumns}
                                    pageSize={pageSize}
                                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                    rowsPerPageOptions={[10, 20, 30]}
                                    disableColumnMenu
                                />
                            </div>
                            : <div className="NoResultsMessage">Oops!! No Results Found.</div>
                    }
                </div>
            </Segment>
        </div>
    );
}
