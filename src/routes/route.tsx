import { useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import styled from "styled-components";
import { useGeolocation } from "../components/geolocation";

const { kakao } = window;

const KakaoMap = styled.div`
  width: 100%;
  height: 500px;
`;

export default function Route() {
  const [map, setMap] = useState<any>(null);
  const location = useGeolocation();

  const [drawingFlag, setDrawingFlag] = useState(false);
  const [clickLine, setClickLine] = useState<any>(null);
  const [moveLine, setMoveLine] = useState<any>(null);
  const [dots, setDots] = useState<Array<any>>([]);
  const [distanceOverlay, setDistanceOverlay] = useState<any>(null);

  const _deleteClickLine = () => {
    if (clickLine) {
      clickLine.setMap(null);
      setClickLine(null);
    }
  };

  // 클릭 지점에 대한 정보 (동그라미와 클릭 지점까지의 총거리)를 지도에서 모두 제거하는 함수입니다
  const _deleteCircleDot = () => {
    console.log("_deleteCircleDot", dots);

    for (let i = 0; i < dots.length; i++) {
      if (dots[i].circle) {
        dots[i].circle.setMap(null);
      }

      if (dots[i].distance) {
        dots[i].distance.setMap(null);
      }
    }

    setDots([]);
  };

  // 그려지고 있는 선의 총거리 정보와
  // 선 그리가 종료됐을 때 선의 정보를 표시하는 커스텀 오버레이를 삭제하는 함수입니다
  const _deleteDistance = () => {
    if (distanceOverlay) {
      distanceOverlay.setMap(null);
      setDistanceOverlay(null);
    }
  };

  const _displayCircleDot = (position: any, distance: any) => {
    const _circleOverlay = new kakao.maps.CustomOverlay({
      content: '<span class="dot"></span>',
      position: position,
      zIndex: 1,
    });

    _circleOverlay.setMap(map);

    let _distanceOverlay = null;

    if (distance > 0) {
      // 클릭한 지점까지의 그려진 선의 총 거리를 표시할 커스텀 오버레이를 생성합니다
      _distanceOverlay = new kakao.maps.CustomOverlay({
        content:
          '<div class="dotOverlay">거리 <span class="number">' +
          distance +
          "</span>m</div>",
        position: position,
        yAnchor: 1,
        zIndex: 2,
      });

      // 지도에 표시합니다
      _distanceOverlay.setMap(map);
    }

    // 배열에 추가합니다
    setDots((prev) => {
      prev.push({ circle: _circleOverlay, distance: _distanceOverlay });
      return prev;
    });
  };

  const _showDistance = (content: any, position: any) => {
    console.log({ distanceOverlay });
    if (distanceOverlay != null) {
      console.log("AAAA");
      // 커스텀오버레이가 생성된 상태이면

      // 커스텀 오버레이의 위치와 표시할 내용을 설정합니다
      distanceOverlay.setPosition(position);
      distanceOverlay.setContent(content);
    } else {
      console.log("BBBB");
      // 커스텀 오버레이가 생성되지 않은 상태이면

      // 커스텀 오버레이를 생성하고 지도에 표시합니다
      setDistanceOverlay(
        new kakao.maps.CustomOverlay({
          map: map, // 커스텀오버레이를 표시할 지도입니다
          content: content, // 커스텀오버레이에 표시할 내용입니다
          position: position, // 커스텀오버레이를 표시할 위치입니다.
          xAnchor: 0,
          yAnchor: 0,
          zIndex: 3,
        })
      );
    }
  };

  useEffect(() => {
    console.log(
      "useEffect",
      { lat: location.latitude, lng: location.longitude },
      map
    );

    if (
      map == null &&
      location.latitude != null &&
      location.longitude != null
    ) {
      console.log("Make Map");

      const container = document.getElementById("map"); //지도를 담을 영역의 DOM 레퍼런스
      const options = {
        //지도를 생성할 때 필요한 기본 옵션
        // center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
        center: new kakao.maps.LatLng(location.latitude, location.longitude), //지도의 중심좌표.
        level: 3, //지도의 레벨(확대, 축소 정도)
      };

      const map = new kakao.maps.Map(container, options);

      setMap(map);
    }

    if (map) {
      console.log("moveto", location.latitude, location.longitude);
      // const _moveTo = new kakao.maps.LatLng(
      //   location.latitude,
      //   location.longitude
      // );

      // map.setCenter(_moveTo);

      var moveLatLon = new kakao.maps.LatLng(
        location.latitude,
        location.longitude
      );

      // var moveLatLon = new kakao.maps.LatLng(33.45058, 126.574942);

      // 지도 중심을 부드럽게 이동시킵니다
      // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
      map.setCenter(moveLatLon);
    }
  }, [location]);

  const _mapClick = (mouseEvent: any) => {
    console.log(mouseEvent);
    const _clickPosition = mouseEvent.latLng;

    if (!drawingFlag) {
      setDrawingFlag(true);

      _deleteClickLine();

      _deleteDistance();

      _deleteCircleDot();

      setClickLine(
        new kakao.maps.Polyline({
          map: map,
          path: [_clickPosition],
          strokeWeight: 3,
          strokeColor: "#db4040",
          strokeOpacity: 1,
          strokeStyle: "solid",
        })
      );

      setMoveLine(
        new kakao.maps.Polyline({
          strokeWeight: 3, // 선의 두께입니다
          strokeColor: "#db4040", // 선의 색깔입니다
          strokeOpacity: 0.5, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
          strokeStyle: "solid", // 선의 스타일입니다
        })
      );

      _displayCircleDot(_clickPosition, 0);
    } else {
      const path = clickLine.getPath();
      path.push(_clickPosition);

      clickLine.setPath(path);

      const distance = Math.round(clickLine.getLength());
      _displayCircleDot(_clickPosition, distance);
    }
  };

  const _distanceHtml = (distance: number) => {
    return `<div class="dotOverlay distanceInfo" style="padding:10px">
        <div>총거리 <span class="number">${distance}</span>m</div>
        <div><span>&nbsp;</span></div>
        <div><span>부분취소: 백스페이스</span></div>
        <div><span>지정완료: 마우스오른쪽, ESC</span></div>
        </div>`;
  };

  const _mapMove = (mouseEvent: any) => {
    // 지도 마우스무브 이벤트가 발생했는데 선을 그리고있는 상태이면
    // console.log("move......", { drawingFlag });

    if (drawingFlag) {
      // 마우스 커서의 현재 위치를 얻어옵니다
      const mousePosition = mouseEvent.latLng;

      // 마우스 클릭으로 그려진 선의 좌표 배열을 얻어옵니다
      const path = clickLine!.getPath();

      // 마우스 클릭으로 그려진 마지막 좌표와 마우스 커서 위치의 좌표로 선을 표시합니다
      const movepath = [path[path.length - 1], mousePosition];
      moveLine.setPath(movepath);
      moveLine.setMap(map);

      const distance = Math.round(clickLine.getLength() + moveLine.getLength()), // 선의 총 거리를 계산합니다
        content = _distanceHtml(distance); // 커스텀오버레이에 추가될 내용입니다

      // 거리정보를 지도에 표시합니다
      _showDistance(content, mousePosition);
    }
  };

  const _mapRightClick = () => {
    if (drawingFlag) {
      moveLine.setMap(null);
      setMoveLine(null);

      // 마우스 클릭으로 그린 선의 좌표 배열을 얻어옵니다
      const path = clickLine.getPath();

      // 선을 구성하는 좌표의 개수가 2개 이상이면
      if (path.length > 1) {
        // 마지막 클릭 지점에 대한 거리 정보 커스텀 오버레이를 지웁니다
        if (dots[dots.length - 1].distance) {
          dots[dots.length - 1].distance.setMap(null);
          dots[dots.length - 1].distance = null;
        }

        var distance = Math.round(clickLine.getLength()), // 선의 총 거리를 계산합니다
          content = _getTimeHTML(distance); // 커스텀오버레이에 추가될 내용입니다

        // 그려진 선의 거리정보를 지도에 표시합니다
        _showDistance(content, path[path.length - 1]);
      } else {
        // 선을 구성하는 좌표의 개수가 1개 이하이면
        // 지도에 표시되고 있는 선과 정보들을 지도에서 제거합니다.
        _deleteClickLine();
        _deleteCircleDot();
        _deleteDistance();
      }
    }

    setDrawingFlag(false);
  };

  // 마우스 우클릭 하여 선 그리기가 종료됐을 때 호출하여
  // 그려진 선의 총거리 정보와 거리에 대한 도보, 자전거 시간을 계산하여
  // HTML Content를 만들어 리턴하는 함수입니다
  const _getTimeHTML = (distance: number) => {
    // 도보의 시속은 평균 4km/h 이고 도보의 분속은 67m/min입니다
    var walkkTime = (distance / 67) | 0;
    var walkHour = "",
      walkMin = "";

    // 계산한 도보 시간이 60분 보다 크면 시간으로 표시합니다
    if (walkkTime > 60) {
      walkHour =
        '<span class="number">' + Math.floor(walkkTime / 60) + "</span>시간 ";
    }
    walkMin = '<span class="number">' + (walkkTime % 60) + "</span>분";

    // 자전거의 평균 시속은 16km/h 이고 이것을 기준으로 자전거의 분속은 267m/min입니다
    var bycicleTime = (distance / 227) | 0;
    var bycicleHour = "",
      bycicleMin = "";

    // 계산한 자전거 시간이 60분 보다 크면 시간으로 표출합니다
    if (bycicleTime > 60) {
      bycicleHour =
        '<span class="number">' + Math.floor(bycicleTime / 60) + "</span>시간 ";
    }
    bycicleMin = '<span class="number">' + (bycicleTime % 60) + "</span>분";

    // 거리와 도보 시간, 자전거 시간을 가지고 HTML Content를 만들어 리턴합니다
    var content = '<ul class="dotOverlay distanceInfo">';
    content += "    <li>";
    content +=
      '        <span class="label">총거리</span><span class="number">' +
      distance +
      "</span>m";
    content += "    </li>";
    content += "    <li>";
    content += '        <span class="label">도보</span>' + walkHour + walkMin;
    content += "    </li>";
    content += "    <li>";
    content +=
      '        <span class="label">자전거</span>' + bycicleHour + bycicleMin;
    content += "    </li>";
    content += "</ul>";

    return content;
  };

  const _keyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Backspace":
        if (drawingFlag) {
          const path: Array<any> = clickLine.getPath();

          if (path.length > 1) {
            path.pop();
            clickLine.setPath(path);

            const lastDot = dots.pop();
            lastDot.circle.setMap(null);
            lastDot.distance.setMap(null);

            setDots(dots);

            const _movePath = moveLine.getPath();
            _movePath[0] = path[path.length - 1];

            moveLine.setPath(_movePath);
            moveLine.setMap(map);

            const distance = Math.round(
                clickLine.getLength() + moveLine.getLength()
              ), // 선의 총 거리를 계산합니다
              content = _distanceHtml(distance); // 커스텀오버레이에 추가될 내용입니다

            // 거리정보를 지도에 표시합니다
            _showDistance(content, _movePath[1]);
          }
        }
        break;
      case "Escape":
        if (drawingFlag) {
          _mapRightClick();
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", _keyDown);

    if (map) {
      console.log("add event listener");

      kakao.maps.event.addListener(map, "click", _mapClick);
      kakao.maps.event.addListener(map, "mousemove", _mapMove);
      kakao.maps.event.addListener(map, "rightclick", _mapRightClick);
    }

    return () => {
      document.removeEventListener("keydown", _keyDown);

      if (map) {
        kakao.maps.event.removeListener(map, "click", _mapClick);
        kakao.maps.event.removeListener(map, "mousemove", _mapMove);
        kakao.maps.event.removeListener(map, "rightclick", _mapRightClick);
      }
    };
  }, [map, drawingFlag, distanceOverlay]);

  return (
    <Fragment>
      <KakaoMap id="map"></KakaoMap>
    </Fragment>
  );
}
