import {Icon} from '@astryxdesign/core/Icon';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {SideNav,SideNavHeading,SideNavItem,SideNavSection} from '@astryxdesign/core/SideNav';

export function MyPageSideNav(){return <SideNav header={<SideNavHeading heading="Linkit" subheading="학생회 운영 데스크" headingHref="/" icon={<NavIcon icon={<Icon icon="checkDouble" size="sm"/>}/>}/>}><SideNavSection title="운영"><SideNavItem label="인수인계" icon="checkDouble" href="/workspace"/><SideNavItem label="조직도" icon="group" href="/organization-chart"/></SideNavSection><SideNavSection title="계정"><SideNavItem label="마이페이지" icon="wrench" href="/my-page" isSelected/></SideNavSection></SideNav>}
