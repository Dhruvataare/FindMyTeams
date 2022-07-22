import { useState, useEffect } from "react";
import "./TeamInfoTileChannelDocuments.css";
import { Segment, Skeleton, Text, Flex, FlexItem, Button, Input } from "@fluentui/react-northstar";
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { SearchIcon, CloseIcon, RetryIcon, ArchiveIcon } from '@fluentui/react-icons-northstar';
import { GetAllChannelDocuments } from '../../Services/FindMyTeamsServices/FindMyTeamsServices';
import constant from "../../Services/lib/constants.json";

export function ChannelDocumentsPortal(props: { teamData?: any, getIsPopupOpen?: any, togglePortal?: any, setExecute?: any, closePortal?: any }) {
    const { teamData, closePortal } = { ...props };
    const [channelDocumentsSearchValue, getChannelDocumentsSearchValue] = useState("");
    const [isSearchResults, getSearchResult] = useState(true);
    const [pageSize, setPageSize] = useState<number>(10);
    const header = {
        items: [
            {
                field: constant.TeamsHeader.fieldFileName,
                headerName: constant.TeamsHeader.headerFileName,
                flex: 1,
                sortComparator: (v1: any, v2: any) => v1.name.localeCompare(v2.name),
                renderCell: (file: GridRenderCellParams<any>) => {
                    return <a target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }} href={`${file.value.webUrl}`}>{file.value.name}</a>
                }
            },
            { field: constant.TeamsHeader.fieldModifiedDate, headerName: constant.TeamsHeader.headerModifiedDate, flex: 1 },
            { field: constant.TeamsHeader.fieldModifiedBy, headerName: constant.TeamsHeader.headerModifiedBy, flex: 1 }],
    }
    const { data, loading, error, reload } = GetAllChannelDocuments(teamData);
    let allChannelDocuments = (loading === false) && data?.channelDocuments.value
        .map((file: any) => ({
            key: file.id,
            id: file.id,
            headerFileName: file,
            fileName: file.name,
            modifiedDate: new Date(file.lastModifiedDateTime).toDateString(),
            modifiedBy: file.lastModifiedBy.user.displayName
        }));
    const [channelDocuments, getChannelDocuments] = useState(allChannelDocuments);

    useEffect(() => {
        getChannelDocuments(allChannelDocuments);
    }, []);

    useEffect(() => {
        let filteredChannelDocumentsData = [];
        if (data?.channelDocuments.value) {
            if (channelDocumentsSearchValue !== "") {
                filteredChannelDocumentsData = [...allChannelDocuments].filter((itm: any, idx: number) => {
                    return itm.fileName.toUpperCase().indexOf(channelDocumentsSearchValue) > -1
                });
                getChannelDocuments(filteredChannelDocumentsData);
                (filteredChannelDocumentsData.length === 0) ? getSearchResult(false) : getSearchResult(true);
            }
            else {
                getChannelDocuments(allChannelDocuments);
                getSearchResult(true);
            }
        }
    }, [channelDocumentsSearchValue]);

    const onKeyPress = (e: any) => {
        let keyValue = e.target.value;
        if (e.keyCode === 13) {
            getChannelDocumentsSearchValue(keyValue.toUpperCase());
        }
        if (e.keyCode === 8 && e.target.defaultValue.length === 1) {
            getChannelDocumentsSearchValue("");
        }

    }
    const onSearchTextDelete = (e: any, data: any) => {
        if (data.value === "") getChannelDocumentsSearchValue("");
    }

    return (
        <div  >
            <Segment inverted color={teamData.headerColor} className="ChannelDocumentsPortalHeader">
                <Flex gap="gap.small">
                    <Text content={teamData.displayName} className="teamName" align="center" size="medium" weight="bold" />
                    <FlexItem push>
                        <Button
                            icon={<CloseIcon />}
                            className="closeButton"
                            text
                            iconOnly
                            title={constant.BtnClose}
                            onClick={closePortal}
                        />
                    </FlexItem>
                </Flex>
            </Segment>
            <Segment >
                <Flex space="between" vAlign="center" padding="padding.medium">
                    <Flex gap="gap.small" >
                        <ArchiveIcon outline className="modalIcon" />
                        <Text content="Documents" align="center" size="large" weight="semibold" />
                    </Flex>
                    <Flex gap="gap.small" style={{ width: "50%" }}>
                        <Input
                            clearable
                            fluid
                            icon={<SearchIcon />}
                            placeholder={constant.SearchFilesPlaceHolder}
                            onKeyDown={onKeyPress}
                            onChange={onSearchTextDelete}
                        />
                        <Button
                            icon={<RetryIcon />}
                            onClick={reload}
                            text
                            iconOnly
                            title="refresh files"
                        />
                    </Flex>
                </Flex>
                <div className="ChannelDocumentsPortalTable">
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
                                    rows={channelDocuments === false ? allChannelDocuments : channelDocuments}
                                    columns={header.items}
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
