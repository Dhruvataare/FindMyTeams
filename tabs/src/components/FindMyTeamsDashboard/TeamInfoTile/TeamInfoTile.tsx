import "./TeamInfoTile.css";
import { TeamInfoTileChannelDocuments } from "../TeamInfoTileChannelDocuments/TeamInfoTileChannelDocuments";
import { TeamInfoTileChannels } from "..//TeamInfoTileChannels/TeamInfoTileChannels";
import { TeamInfoTileUsers } from "..//TeamInfoTileUsers/TeamInfoTileUsers";
import { Segment, Skeleton, Avatar, Text, Flex, FlexItem} from "@fluentui/react-northstar";
import { SpeakerPersonIcon, ContactGroupIcon, TagIcon } from '@fluentui/react-icons-northstar';
import constant from "../../Services/lib/constants.json";

export function TeamInfoTile(props: { allTeamsData?: any, loading?: boolean, localStorageLoading?: boolean, getIsPopupOpen?: any, isGroupByActive?: boolean, tileDirection?: string }) {
  const { allTeamsData, localStorageLoading, getIsPopupOpen, isGroupByActive, tileDirection } = { ...props }
  let arr = Array.from(Array(15).keys());
  
  return (
    <div className={isGroupByActive ? tileDirection === "Columns" ? "mainDiv mainDivColumn" : "mainDiv mainDivRow" : "mainDiv"}>
      {
        allTeamsData && localStorageLoading ?
          arr.map((element: any) => {
            return (
              <div className="teamInfoTile">
                <Skeleton animation="wave">
                  <Flex gap="gap.small" padding="padding.medium">
                    <Skeleton.Shape round width="32px" height="32px" />
                    <div>
                      <Skeleton.Line width="200px" />
                      <Skeleton.Line width="150px" />
                    </div>
                  </Flex>
                </Skeleton>
                <Skeleton animation="wave">
                  <Flex column gap="gap.small">
                    <Skeleton.Shape width="100%" />
                  </Flex>
                </Skeleton>
                <div className="footer">
                  <Skeleton animation="wave">
                    <Skeleton.Shape height="1rem" width="100%" />
                  </Skeleton>
                </div>
              </div>
            );
          })
          : allTeamsData &&
          allTeamsData.map((itemData: any, idx: number) => {
            return (
              isGroupByActive ?
                _renderTeamInfoTile(itemData.teamData, idx, getIsPopupOpen)
                : _renderTeamInfoTile(itemData, idx, getIsPopupOpen)
            )
          })
      }
    </div>
  );
}

const _renderTeamInfoTile = (itemData: any, key: any, getIsPopupOpen?: any) => {
  let headerColor = itemData.userRole ? "brand" : "green";
  itemData["headerColor"] = headerColor;
  return (
    <div className="teamInfoTile" key={key}>
      <div className="body">
        <div>
          <div className="teamTitle">
            <Avatar
              name={itemData.displayName}
              color={headerColor}
              square
              label={{
                variables: {
                  backgroundColor: { headerColor },
                },
              }}
            />
            <div className="teamTitleText">
              <Text
                content={itemData.displayName}
                onClick={() => {
                  window.open(
                    itemData.teamLink === null ? "#" : itemData.teamLink
                  );
                }}
              ></Text>
            </div>
          </div>
          <div className="teamDescription">
            <div>{itemData.description}</div>
          </div>
        </div>
        <div className="otherIcons">
          <div>
            <TeamInfoTileChannelDocuments
              teamData={itemData}
              getIsPopupOpen={getIsPopupOpen}
            />
          </div>
          <div>
            <TeamInfoTileChannels
              teamData={itemData}
              getIsPopupOpen={getIsPopupOpen}
            />
          </div>
          <div>
            <TeamInfoTileUsers
              teamData={itemData}
              getIsPopupOpen={getIsPopupOpen}
            />
          </div>
        </div>
      </div>
      <div>
        <Segment inverted color={headerColor} className="footer">
          {itemData.userRole ?
            <Flex gap="gap.small" vAlign="center">
              <TagIcon size="smaller" />
              <Text title={"Tags: " + itemData.tags?.toString()} className="footerText" content={"Tags: " + JSON.stringify(itemData.tags?.length > 0 ? itemData.tags : ["No tags available"]).replace("[", "").replace("]", "").replaceAll(',', ', ').replaceAll('"', '')} align="start" size="small" />
              <FlexItem push ><SpeakerPersonIcon title={constant.YouAreTheOwner} /></FlexItem>
            </Flex>
            :
            <Flex gap="gap.small" vAlign="center">
              <TagIcon size="smaller" />
              <Text title={"Tags: " + itemData.tags?.toString()} className="footerText" content={"Tags: " + JSON.stringify(itemData.tags?.length > 0 ? itemData.tags : ["No tags available"]).replace("[", "").replace("]", "").replaceAll(',', ', ').replaceAll('"', '')} align="start" size="small" />
              <FlexItem push ><ContactGroupIcon title={constant.YouAreTheMember} /></FlexItem>
            </Flex>
          }
        </Segment>
      </div>
    </div>
  );
};
