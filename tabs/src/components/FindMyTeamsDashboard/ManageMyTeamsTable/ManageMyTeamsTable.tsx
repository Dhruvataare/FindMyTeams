import React, { useState, useEffect } from "react";
import "./ManageMyTeamsTable.css";
import { Segment, Provider, Skeleton, Flex, FlexItem, Input } from "@fluentui/react-northstar";
import { SearchIcon } from '@fluentui/react-icons-northstar';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ManageMyTeamsAddTableRows } from '../ManageMyTeamsAddTableRows/ManageMyTeamsAddTableRows';
import { ManageMyTeamsRemoveTableRows } from '../ManageMyTeamsRemoveTableRows/ManageMyTeamsRemoveTableRows';
import { ManageMyTeamsAddTags } from '../ManageMyTeamsAddTags/ManageMyTeamsAddTags';
import { ManageMyTeamsRemoveTags } from '../ManageMyTeamsRemoveTags/ManageMyTeamsRemoveTags';

export function ManageMyTeamsTable(props: {
  header: any, rows: any, manageMyTeamsState: any, getManageMyTeamsState: any, data: any,
  localStorageLoading: boolean, selectedMenuOption: string
}) {
  const { header, rows, manageMyTeamsState, getManageMyTeamsState, data, localStorageLoading, selectedMenuOption } = { ...props };
  const columns: GridColDef[] = header.items;
  const [selectedRowData, getSelectedRowData] = useState([]);
  const [teamsSearchValue, getTeamsSearchValue] = useState("");
  const [isSearchResults, getSearchResult] = useState(true);
  const [pageSize, setPageSize] = React.useState<number>(10);

  const handleSelectedRows = (ids: any) => {
    const selectedIDs = new Set(ids);
    const reqSelectedRowData = rows.filter((row: any) =>
      selectedIDs.has(row.key)
    );
    getSelectedRowData(reqSelectedRowData);
  }
  const [reqRows, getReqRows] = useState(rows && rows);
  useEffect(() => {
    let filteredTeamData = [];
    if (rows === undefined) return;
    if (rows.length > 0) {
      if (teamsSearchValue !== "") {
        filteredTeamData = rows.filter((itm: any, idx: number) => {
          return itm.teamName.toUpperCase().indexOf(teamsSearchValue) > -1 || itm.teamDescription?.toUpperCase().indexOf(teamsSearchValue) > -1 || itm.tags?.toUpperCase().indexOf(teamsSearchValue) > -1;
        });
        getReqRows(filteredTeamData);
        (filteredTeamData.length === 0) ? getSearchResult(false) : getSearchResult(true);
      }
      else {
        getSearchResult(true);
        getReqRows(rows);
      }
    }
  }, [teamsSearchValue, localStorageLoading]);

  ////uncheck all rows on change of 'selectedMenuOption' ////
  useEffect(() => {
    let headerContainer = Array.from(document.getElementsByClassName('MuiDataGrid-columnHeaderTitleContainer') as HTMLCollectionOf<HTMLElement>);
    if (headerContainer.length > 0) {
      let input = headerContainer[0].children[0].children[0].firstElementChild as HTMLInputElement;
      let isChecked = input.checked;
      if (isChecked === true) {
        input.click();
      }
    }
    getSelectedRowData([]);
  }, [selectedMenuOption]);

  const onKeyPress = (e: any) => {
    let keyValue = e.target.value;
    if (e.keyCode === 13) {
      getTeamsSearchValue(keyValue.toUpperCase());
    }
    if (e.keyCode === 8 && e.target.defaultValue.length === 1) {
      getTeamsSearchValue("");
    }
  }
  const onSearchTextDelete = (e: any, data: any) => {
    if (data.value === "") getTeamsSearchValue("");
  }
  return (
    <>
      <Segment inverted color="brand" className="ManageTeamsTableHeader">
        <Flex gap="gap.small" >
          {selectedMenuOption === "Membership" ?
            <>
              <ManageMyTeamsAddTableRows
                teamsData={selectedRowData}
                manageMyTeamsState={manageMyTeamsState}
                getManageMyTeamsState={getManageMyTeamsState}
                selectedMenuOption={selectedMenuOption}
              />
              <ManageMyTeamsRemoveTableRows
                teamsData={selectedRowData}
                manageMyTeamsState={manageMyTeamsState}
                getManageMyTeamsState={getManageMyTeamsState}
                selectedMenuOption={selectedMenuOption}
              />
            </>
            : selectedMenuOption === "Tags" ?
              <>
                <ManageMyTeamsAddTags
                  teamsData={selectedRowData}
                  manageMyTeamsState={manageMyTeamsState}
                  getManageMyTeamsState={getManageMyTeamsState}
                  rows={rows}
                />
                <ManageMyTeamsRemoveTags
                  teamsData={selectedRowData}
                  manageMyTeamsState={manageMyTeamsState}
                  getManageMyTeamsState={getManageMyTeamsState}
                  rows={rows}
                />
              </>
              : <></>
          }
          <FlexItem push size='size.half'>
            <Input
              clearable
              fluid
              icon={<SearchIcon />}
              placeholder="Search for teams here.."
              onKeyDown={onKeyPress}
              onChange={onSearchTextDelete}
            />
          </FlexItem>
        </Flex>
      </Segment>
      <div className="ManageTeamsTableBody">
        {
          isSearchResults ?
            data && localStorageLoading ?
              <Provider >
                <Skeleton animation="wave" style={{ marginTop: "1rem" }}>
                  <Skeleton.Line height="3rem" />
                  <Skeleton.Line height="3rem" />
                  <Skeleton.Line height="3rem" />
                  <Skeleton.Line height="3rem" />
                  <Skeleton.Line height="3rem" />
                  <Skeleton.Line height="3rem" />
                  <Skeleton.Line height="3rem" />
                  <Skeleton.Line height="3rem" />
                  <Skeleton.Line height="3rem" />
                </Skeleton>
              </Provider>
              : data &&
              <div className="DataGridBody">
                <DataGrid
                  rows={reqRows === false || reqRows === null ? rows : reqRows}
                  columns={columns}
                  pageSize={pageSize}
                  disableColumnMenu
                  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                  rowsPerPageOptions={[10, 25, 50]}
                  checkboxSelection
                  disableSelectionOnClick
                  onSelectionModelChange={handleSelectedRows}
                  components={{
                    NoRowsOverlay: () => (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        No Data. Hit Refresh.
                      </div>
                    )
                  }}
                />
              </div>
            : <div className="NoResultsMessage">Oops!! No Results Found.</div>
        }
      </div>
    </>
  );
}
