import { useEffect, useState } from "react";
import styled from "styled-components";
import { ListProps } from "../interfacce/list-interface";
import MapStore from "../stores/map-store";
import SearchBox from "./search-box";
import CustomOverlay from "./custom-overlay";

interface ActiveProps {
    $active: boolean;
}

const Wrapper = styled.div`
    position: relative;
`;

const Kakao = styled.div<ActiveProps>`
    width: 100%;
    height: ${(props) => (props.$active ? "54vh" : "87.8vh")};
    @media (min-width: 1025px) {
        height: 100vh;
    }
`;

const Search = styled.div`
    position: absolute;
    z-index: 999;
    width: 100%;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    @media (min-width: 1025px) {
        display: none;
    }
`;

const IconWrapper = styled.div`
    position: absolute;
    cursor: pointer;
    border: none;
    display: flex;
    justify-content: center;
    background-color: #ffffff;
    border-radius: 100%;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    z-index: 998;
    &:hover {
        opacity: 0.8;
    }
    @media (max-width: 1024px) {
        bottom: 10%;
        left: 12px;
    }
    @media (min-width: 1025px) {
        bottom: 5%;
        right: 2%;
    }
`;

const NearbyIcon = styled.div`
    position: absolute;
    cursor: pointer;
    display: flex;
    align-items: center;
    background-color: #ffffff;
    z-index: 998;
    padding: 8px 12px;
    border-radius: 20px;
    left: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    transform: translateX(-50%);
    font-size: 14px;
    gap: 6px;
    &:hover {
        opacity: 0.9;
    }
    @media (max-width: 1024px) {
        top: 90px;
    }
    @media (min-width: 1025px) {
        bottom: 5%;
        font-size: 16px;
    }
`;

const SliderWrapper = styled.div`
    position: absolute;
    cursor: pointer;
    background-color: #ffffff;
    border: none;
    display: flex;
    justify-content: center;
    border-radius: 100%;
    padding: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    z-index: 998;
    bottom: 10%;
    right: 12px;
    &:hover {
        opacity: 0.8;
    }
    @media (min-width: 1025px) {
        display: none;
    }
`;

const KakaoMap: React.FC<{ list: ListProps[] }> = ({ list }) => {
    const {
        location,
        selected,
        openList,
        setOpenList,
        setSelected,
        setLocation,
    } = MapStore();
    const [myMap, setMyMap] = useState<kakao.maps.Map | null>(null);
    const [markers, setMarkers] = useState<kakao.maps.Marker[]>([]);
    const [ctOverlay, setCtOverlay] = useState<kakao.maps.CustomOverlay | null>(
        null
    );
    const [initial, setInitial] = useState(false);
    const [visible, setVisible] = useState(false);
    const kakao = window.kakao;

    // 최초 로딩 시 지도 생성
    useEffect(() => {
        kakao.maps.load(() => {
            const container = document.getElementById("map");
            if (container && !myMap) {
                const options = {
                    center: new kakao.maps.LatLng(
                        37.570227990912244,
                        126.98315081716676
                    ),
                    level: 4,
                };
                const initialMap = new kakao.maps.Map(container, options);
                setMyMap(initialMap);
                setInitial(true);
                // 현재 사용자 위치 구하고 마커로 나타내는 함수
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    const current = new kakao.maps.LatLng(latitude, longitude);
                    const myMarkerUrl = "/svg/current.svg";
                    const myMarkerSize = new kakao.maps.Size(40, 40);
                    const myMarkerImage = new kakao.maps.MarkerImage(
                        myMarkerUrl,
                        myMarkerSize
                    );
                    const currentMarker = new kakao.maps.Marker({
                        position: current,
                        image: myMarkerImage,
                    });
                    currentMarker.setMap(initialMap);
                });
            }
        });
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 새로운 카페 리스트를 받아올 때의 지도 작업
    useEffect(() => {
        markers.forEach((marker) => marker.setMap(null));
        if (ctOverlay) ctOverlay.setMap(null);

        // 리스트에 있는 카페 좌표를 마커로 나타내는 함수(클릭 이벤트 발생 이전 커스텀 오버레이 삭제해야 함)
        const createMarkers = (items: ListProps[], map: kakao.maps.Map) => {
            return items.map((item) => {
                let markerUrl;
                if (item.unmanned === true) {
                    // 무인 24시간
                    if (item.closed === null) {
                        markerUrl = "/svg/muinallday.svg";
                    } else {
                        // 무인 24시간 X
                        markerUrl = "/svg/muin.svg";
                    }
                } else {
                    // 24시간
                    if (item.closed === null) {
                        markerUrl = "/svg/allday.svg";
                    } else {
                        // 24시간 X
                        markerUrl = "/svg/parttime.svg";
                    }
                }
                const markerSize = new kakao.maps.Size(36, 46);
                const markerImage = new kakao.maps.MarkerImage(
                    markerUrl,
                    markerSize
                );
                const markerPosition = new kakao.maps.LatLng(
                    item.lat,
                    item.lng
                );
                const marker = new kakao.maps.Marker({
                    position: markerPosition,
                    image: markerImage,
                    title: item.name,
                    clickable: true,
                });
                const overlay = CustomOverlay(
                    item.name,
                    item.address,
                    item.lat,
                    item.lng
                );
                kakao.maps.event.addListener(marker, "click", () => {
                    overlay.setMap(map);
                });
                kakao.maps.event.addListener(map, "click", () =>
                    overlay.setMap(null)
                );
                return marker;
            });
        };

        if (myMap) {
            myMap.setLevel(4);
            if (list) {
                const CafeMarkers = createMarkers(list, myMap);
                setMarkers(CafeMarkers);
                CafeMarkers.forEach((marker) => marker.setMap(myMap));
            }
            if (selected[0] !== "") {
                const overlay = CustomOverlay(
                    selected[0],
                    selected[1],
                    selected[2],
                    selected[3]
                );
                overlay.setMap(myMap);
                myMap.setCenter(overlay.getPosition());
                setCtOverlay(overlay);
                kakao.maps.event.addListener(myMap, "click", () =>
                    overlay.setMap(null)
                );
            }
            kakao.maps.event.addListener(myMap, "center_changed", () => {
                const center = myMap.getCenter();
                if (
                    center.getLat().toFixed(3) !== location[0].toFixed(3) &&
                    center.getLng().toFixed(3) !== location[1].toFixed(3)
                ) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            });
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list]);

    // 최초 지도가 생성된 이후에 중심 좌표 현재 사용자 위치로 이동
    useEffect(() => {
        if (location[0] && location[1] && myMap && initial) {
            const newCenter = new kakao.maps.LatLng(location[0], location[1]);
            myMap.setCenter(newCenter);
            setInitial(false);
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myMap, location]);

    useEffect(() => {
        if (myMap) {
            myMap.relayout();
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openList]);

    // 현재 사용자 위치로 이동하는 함수
    const onClickLocate = () => {
        if (myMap) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const current = new kakao.maps.LatLng(latitude, longitude);
                myMap.setCenter(current);
            });
        }
    };

    const handleToggle = () => {
        setOpenList();
        setSelected(["", "", 0, 0]);
    };

    const handleNearBy = () => {
        if (myMap) {
            const newCenter = myMap.getCenter();
            setLocation([newCenter.getLat(), newCenter.getLng()]);
            setVisible(false);
            setSelected(["", "", 0, 0]);
        }
    };

    return (
        <Wrapper>
            <Kakao id="map" $active={openList} />
            <Search>
                <SearchBox />
            </Search>
            <IconWrapper onClick={onClickLocate}>
                <img
                    alt="location-icon"
                    src="/svg/location.svg"
                    height="20"
                    width="20"
                />
            </IconWrapper>
            <SliderWrapper onClick={handleToggle}>
                {openList ? (
                    <img
                        alt="arrow-down-icon"
                        src="/svg/arrowdown.svg"
                        height="20"
                        width="20"
                    />
                ) : (
                    <img
                        alt="arrow-up-icon"
                        src="/svg/arrowup.svg"
                        height="20"
                        width="20"
                    />
                )}
            </SliderWrapper>
            {visible && (
                <NearbyIcon onClick={handleNearBy}>
                    <img
                        alt="search-nearby-icon"
                        src="/svg/search.svg"
                        height="20"
                        width="20"
                    />
                    현재 지도에서 찾기
                </NearbyIcon>
            )}
        </Wrapper>
    );
};

export default KakaoMap;
